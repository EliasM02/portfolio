Level: Easy  
Date: April 15, 2026  
Target IP: 10.113.191.216

Nmap

![[Pasted image 20260415222616.png]]

Visited the webpage

![[Pasted image 20260415222659.png]]


The PHP server looked odd to me. I've never seen that before and decided to look it up.

![[Pasted image 20260415222803.png]]

And there was a CVE with RCE.
I downloaded the python script available and ran it.

![[Pasted image 20260415223556.png]]

And I was root, but no flag right away so I searched for it.

![[Pasted image 20260415223632.png]]

And there's the flag.

Flag: flag{4127d0530abf16d6d23973e3df8dbecb}
