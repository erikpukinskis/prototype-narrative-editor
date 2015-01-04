Todo
----

 - [X] Commit when I click commit

Timebox dogfooding chores:

 - [ ] Use document instead of focus-input
 - [ ] Paste (http://datatables.net/blog/2014-01-31)
 - [ ] Separate live and baked instances that get reloaded as save- and commit-time respectively
 - [ ] Cut (optional, https://github.com/timdown/rangy)

That's 0.5.0, dogfooding. Then we can move on to feedback:

 - [ ] A test in an `introspect` block injects a paragraph in the DOM on the client
 - [ ] Styles are swapped out as-you-type
 - [ ] Client-side js gets re-loaded as-you-type
 - [ ] Server-side lib reloading works with `introspect`
 - [ ] Servers reloaded with `introspect`
 - [ ] Remove ticked commands

That'll be 0.6.0, hot running.


Backlog
-------

 - Server-side js test running with `introspect`
 - Client-side data structures get rebuilt as-you-type (change propagation framework?)
 - Load deps from db after restart
 - Actually make the narratives read well
 - Find dependencies of dependencies
 - Multi-user
 - Running narratives in a secure jail
 - Basic quota system
 - Push to Heroku

 One other interesting next step would be to try to split out a minimal core that could be distributed as a really simple server.js + package.json + Procfile that could go to github and get all the narratives it needs. Then that can go into a traditional git repo that we largely don't touch and then we work on everything else.
