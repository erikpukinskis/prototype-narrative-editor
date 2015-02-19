Todo
----

New strategy:

Do just what you have to do to get Bounty up. Start with the first one and go line by line, making it work in the browser however you have to. Maintain a version of the narrative with just the lines up to that point.

Enforce the rule of application-level code is plausibly written and deployed by a non-programer.

[ ] Get 'bobby follows berries' scenario to run
[ ] Get bobby.tap to click the button

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
