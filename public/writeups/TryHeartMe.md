
Level: Easy  
Target IP: 10.112.178.226  
Date: April 15, 2026

Introduction
"The TryHeartMe shop is open for business. Can you find a way to purchase the hidden "Valenflag" item? You can access the web app here http://TARGET-IP:5000"

![[Pasted image 20260415224421.png]]

Let's visit the webserver on port 5000

![[Pasted image 20260415224608.png]]

A gift shop, with credits for purchases, I'll  try making an account and see what happens.

![[Pasted image 20260415224810.png]]

I'm guessing I'll have to find some way to get credits to buy this Valenflag.

![[Pasted image 20260415225048.png]]

When looking at the request with Burp I get this. 

![[Pasted image 20260415225355.png]]

With emphasis on encoded, maybe decoding it will give some clues.

![[Pasted image 20260415225454.png]]

This is interesting. It says I'm "user" and my credits are 0. What if I can change these to Admin and, well, more than 0 credits and then change the cookie?

![[Pasted image 20260415225732.png]]

I get a new JWT token that seems to be valid.

![[Pasted image 20260415230151.png]]

If I just changed the cookie and refreshed the page (Ctrl + R) the Valenflag shows up and my credits are changed. Went a little overkill on the credits but I guess I can buy all the items and support the shop.
Anyway, let's see what this new item is all about.


![[Pasted image 20260415230456.png]]

Bought the item and got a flag with it!


Flag: THM{v4l3nt1n3_jwt_c00k13_t4mp3r_4dm1n_sh0p}