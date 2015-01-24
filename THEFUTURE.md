Todo
----

OK, so right now it doesn't seem like the hot loading is working well. And the bootstrapping is in a weird place. And I don't feel comfortable dogfooding, but I put a bunch of energy into that direction, and it doesn't feel like staying in the filesystem will work either. Boo.

Backlog
-------

 - Some more intelligent approach to multiple versions of servers running at once
 - Cut (https://github.com/timdown/rangy)
 - Enter key from first line
 - Backspacing onto first line
 - Server-side js test blocks
 - Client-side data structures get rebuilt as-you-type (change propagation framework?)
 - Load deps from db after restart
 - Actually make the narratives read well
 - Find dependencies of dependencies
 - Multi-user
 - Running narratives in a secure jail
 - Basic quota system
 - Push to Heroku

 One other interesting next step would be to try to split out a minimal core that could be distributed as a really simple server.js + package.json + Procfile that could go to github and get all the narratives it needs. Then that can go into a traditional git repo that we largely don't touch and then we work on everything else.
