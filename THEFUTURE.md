Todo
----

 - [X] Dogfooding fixes
 - [ ] 'client js test' command block injects a paragraph in the DOM
 - [ ] 'style' blocks are swapped out as-you-type
 - [ ] 'client js' blocks gets re-loaded as-you-type
 - [ ] 'lib' blocks reload server-side
 - [ ] 'server' blocks reloaded
 - [ ] Remove ticked commands

That'll be 0.6.0, hot running.


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
