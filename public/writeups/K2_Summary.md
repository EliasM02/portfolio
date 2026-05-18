---

---

# K2 – Summary


**Platform:** TryHackMe
**Difficulty:** Hard
**Date:** May 14–16, 2026


---

 
## What Made This Room Unique
  
K2 stands out from a typical CTF room because it isn't one machine — it's three, chained together. No stage exists in isolation. Credentials stolen via SQL injection on a Linux web server end up unlocking an Active Directory environment. A hash dumped from that AD server becomes the entry point to the Root Domain Controller. The chain is the challenge.

This structure mirrors how real-world attacks actually unfold: an initial web compromise leads to internal access, internal access leads to credential harvesting, and harvested credentials enable lateral movement through an organisation's core infrastructure. Getting stuck at any stage requires going back to what you already have rather than looking for something new — a mindset shift that sets K2 apart.


---

  
## Full Attack Chain

```

[Base Camp – Linux]

nmap → vhost enum (admin.k2.thm / it.k2.thm)

→ Stored XSS (WAF bypass via base64 + eval)

→ Stolen admin session cookie (james)

→ SQL Injection → credential dump (7 accounts)

→ SSH brute force (Hydra) → shell as james

→ adm group → /var/log access → root password in access.log

→ root
 

        ↓ (credentials carry forward)
 

[Middle Camp – AD #1]

Credential reuse → username format discovery (j.bold, r.bud)

→ WinRM as r.bud → notes hint at password pattern (rockyou + 2 chars)

→ Custom wordlist → kerbrute → j.bold:#8rockyou

→ BloodHound → j.bold GenericAll over j.smith

→ Force password reset on j.smith

→ j.smith ∈ Backup Operators → reg save SAM + SYSTEM

→ secretsdump → Administrator NTLM hash

  
        ↓ (hash carries forward)


[The Summit – AD #2 / Root DC]

Administrator hash reused → j.smith valid on new DC

→ Writable C:\Scripts folder → backup.bat replaced

→ Responder → NTLMv2 hash (o.armstrong)

→ hashcat → arMStronG08

→ BloodHound → o.armstrong ∈ IT Director → GenericWrite on K2ROOTDC$

→ RBCD attack (addcomputer + rbcd + getST)

→ secretsdump as Administrator → Domain Admin

```


---


## Key Techniques

### Base Camp — Web Exploitation Chain

The initial foothold required chaining two web vulnerabilities. A stored XSS payload in a ticket field reached the admin panel — but `document.cookie` was WAF-blocked, requiring a base64-encoded eval payload to bypass the filter.

```
<img src=x onerror="eval(atob('ZmV0Y2goJ...'))" >
```

The stolen session enabled **UNION-based SQL injection** against a ticket search endpoint, dumping the entire `admin_auth` table and exposing plaintext credentials for seven accounts.

**Privilege escalation** came from an unusual source: the `adm` group grants read access to `/var/log` without sudo. The root password appeared in `access.log` as part of a failed login attempt — a reminder that logs themselves can become a liability.


---

  
### Middle Camp — AD Credential Reuse & Backup Operators

The seven credentials from Base Camp didn't map directly to AD usernames. Kerbrute revealed the domain's naming convention (`firstname.lastname`), and cross-referencing with full names found in `/etc/passwd` on the Linux machine identified `j.bold` and `r.bud` as valid targets.

`r.bud`'s documents contained internal notes hinting at a weak password policy: base password `rockyou` plus exactly two characters (one special, one digit). A **custom Python wordlist** generated 320 candidates and kerbrute found `j.bold:#8rockyou`.

BloodHound revealed `j.bold` had **GenericAll** over `j.smith` through the `IT STAFF 1` group — enabling a forced password reset. `j.smith` turned out to be a member of **Backup Operators**, a privileged built-in group that allows reading the SAM and SYSTEM registry hives directly. A secretsdump produced the Administrator NTLM hash.


---


### The Summit — RBCD via GenericWrite

The Administrator hash from Middle Camp reused against The Summit's DC authenticated as `j.smith`. A **writable scripts folder** allowed replacing `backup.bat` — the original script copied `o.armstrong`'s files, so replacing it with a UNC path pointed at a **Responder** listener captured `o.armstrong`'s **NTLMv2 hash** when the scheduled task triggered.

Hashcat cracked it to `arMStronG08`. BloodHound then revealed the critical path:

```
o.armstrong → [MemberOf] → IT Director → [GenericWrite] → K2ROOTDC$
```

**GenericWrite on a computer object** enables a **Resource-Based Constrained Delegation (RBCD) attack**:

1. Create a new machine account (`ATTACKER$`) using `j.smith`'s `SeMachineAccountPrivilege`
2. Set `msDS-AllowedToActOnBehalfOfOtherIdentity` on the DC to trust `ATTACKER$`
3. Request a service ticket impersonating Administrator via `getST`
4. Use the ticket with `secretsdump` to dump all domain hashes

Domain Admin achieved.

  
---


## Key Vulnerabilities
  
| Vulnerability                            | Location                  | Impact                       |
| ---------------------------------------- | ------------------------- | ---------------------------- |
| Stored XSS (WAF bypass)                  | Base Camp – admin panel   | Session hijacking            |
| UNION-based SQL Injection                | Base Camp – ticket search | Full credential dump         |
| Credentials in access.log                | Base Camp – /var/log      | Root password exposure       |
| Credential reuse across machines         | All stages                | Lateral movement             |
| Weak password policy + guessable pattern | Middle Camp               | j.bold password cracked      |
| Backup Operators group misconfiguration  | Middle Camp               | SAM/SYSTEM dump              |
| Writable script folder (world-writable)  | The Summit                | NTLMv2 capture via Responder |
| GenericWrite on DC computer object       | The Summit                | RBCD → Domain Admin          |

  
---

  
## Deep Dive: RBCD Attack

Resource-Based Constrained Delegation is an Active Directory feature that allows a computer to delegate authentication on behalf of users to specific services. When an attacker has **GenericWrite** on a computer object, they can modify the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute to trust a controlled machine account.

The full attack requires three components:

**1. A machine account under attacker control**

`SeMachineAccountPrivilege` (held by standard domain users by default) allows adding up to 10 machine accounts to the domain. `impacket-addcomputer` handles this.

**2. Setting the delegation attribute**

`impacket-rbcd` writes the controlled machine account's SID into the target computer's RBCD attribute — telling the DC "trust this machine to act on behalf of users."

**3. Requesting a forged service ticket**

`impacket-getST` uses the controlled machine account's credentials to request a Kerberos service ticket for `cifs/DC` impersonating any user — including Administrator. This ticket is then passed to `secretsdump` to dump all hashes from the domain.

  
The attack is particularly powerful because GenericWrite on computer objects is easy to overlook during AD hardening — it doesn't look as dangerous as GenericAll or WriteDACL at first glance.

  
---


## Lessons Learned

**Logs are a double-edged sword.** The root password on Base Camp appeared in `access.log` because someone had typed it incorrectly into a username or URL field. Logs intended for debugging became the path to root.

**Credential patterns are predictable.** The hint about `rockyou + 2 characters` reduced the search space to 320 combinations. Password policies that allow predictable transformations of weak base passwords offer false security.

**Built-in groups carry hidden power.** Backup Operators is often overlooked compared to Domain Admins, but the ability to read the SAM and SYSTEM hives is effectively equivalent to having the Administrator hash — which is exactly what happened here.

**GenericWrite ≠ harmless.** On user objects, GenericWrite enables targeted Kerberoasting. On computer objects, it enables RBCD. Neither requires a password or direct admin access to exploit.

**Information flows forward.** Every credential, hash, and username found should be kept and retested on new machines. The Administrator hash from Middle Camp being valid on The Summit's j.smith account was the entire entry point for the final stage.

  
---

  
## Security Recommendations

| Finding                            | Recommendation                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| JWT Algorithm None accepted        | Enforce algorithm verification server-side; reject tokens with `alg: none`             |
| XSS in ticket system               | Implement strict Content Security Policy; sanitise all user input                      |
| SQL Injection in search            | Use parameterised queries / prepared statements                                        |
| Passwords in log files             | Audit log configurations; mask sensitive parameters; rotate any exposed credentials    |
| Credential reuse across systems    | Enforce unique passwords per system; implement privileged access workstations          |
| Guessable password pattern         | Enforce true randomness in password policy; use a password manager                     |
| Backup Operators with WinRM access | Restrict Backup Operators to dedicated backup systems; monitor registry access         |
| World-writable script folder       | Apply principle of least privilege to all scheduled task directories                   |
| GenericWrite on DC object          | Audit AD ACLs regularly with BloodHound; remove unnecessary delegated permissions      |
| Default machine account quota      | Set `ms-DS-MachineAccountQuota` to 0; use dedicated service accounts for machine joins |


---

  
## Tools Used
 
| Tool                             | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `nmap`                           | Port scanning and service enumeration             |
| `ffuf`                           | Subdomain and directory brute forcing             |
| `Burp Suite`                     | HTTP interception, JWT manipulation, WAF analysis |
| `gobuster`                       | Directory enumeration                             |
| `Hydra`                          | SSH credential brute forcing                      |
| `kerbrute`                       | AD username enumeration and password spraying     |
| `NetExec (nxc)`                  | SMB/WinRM authentication and recon                |
| `evil-winrm`                     | WinRM shell access                                |
| `BloodHound + bloodhound-python` | AD attack path visualisation                      |
| `Responder`                      | NTLMv2 hash capture                               |
| `hashcat`                        | Hash cracking                                     |
| `impacket-addcomputer`           | Machine account creation                          |
| `impacket-rbcd`                  | RBCD attribute manipulation                       |
| `impacket-getST`                 | Kerberos service ticket forging                   |
| `impacket-secretsdump`           | SAM/NTDS hash dumping                             |
| `Python`                         | Custom wordlist generation                        |


---

  
## Final Thoughts

K2 is one of the more realistic rooms on TryHackMe precisely because it doesn't reset between machines. The information you carry forward isn't just a convenience — it's the attack surface. The room rewards methodical note-taking and a mindset of "what I already have is probably useful again," which is exactly how real engagements work.

The jump from Middle Camp to The Summit in particular — reusing an Administrator hash, pivoting through a scheduled task to capture a hash via Responder, and then chaining that into an RBCD attack — is a sequence that maps closely to post-exploitation patterns seen in actual red team engagements against AD environments.


---
