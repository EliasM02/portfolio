
Level: Easy  
Date: April 14, 2026  
Target IP: 10.114.184.161

Nmap results:

![[Pasted image 20260414235942.png]]


![[Pasted image 20260415000033.png]]

The webpage on port 80 is just a picture of the squad, let's check the source code for clues.

![[Pasted image 20260415000115.png]]

Aha! Stegonography, could be useful later on. First, I want to check out the FTP on port 21.

![[Pasted image 20260415000444.png]]

I thought I might get some more information by using a more thorough scan.
The ftp allows anonymous login, note_to_jake.txt seems interesting.

![[Pasted image 20260415001231.png]]

![[Pasted image 20260415001320.png]]

Maybe something like Hydra could be of use here?

![[Pasted image 20260415002200.png]]

Nice!

![[Pasted image 20260415002357.png]]

Poking around and got the first flag!
User flag: ee11cbb19052e40b07aac0ca060c23ee

![[Pasted image 20260415002556.png]]

It's owned by root

![[Pasted image 20260415002650.png]]

Jake is able to run "less", let's go to GTFOBins

![[Pasted image 20260415003421.png]]

![[Pasted image 20260415003603.png]]

Privileges.. Escalated!

![[Pasted image 20260415003938.png]]

And there we go!
Root flag: 63a9f0ea7bb98050796b649e85481845

