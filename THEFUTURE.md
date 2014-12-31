! Up Next

 - [X] When I pull a document from the repo, also store its hash
 - [X] When I save a document, change the hash
 - [X] When a document doesn't have a hash, show the new commit widget
 - [X] Commit when I click commit

! Later

 - Hot test running
 - Hot reload of css
 - Hot reload of UI
 - Hot reload of client libs
 - Change propagation framework
 - Load deps from db after restart
 - Actually make the narratives read well (nested comments? copy/paste?)
 - Find dependencies of dependencies
 - Multi-user
 - Running narratives in a secure jail
 - Basic quota system
 - Push to Heroku

 One interesting next step would be to try to split out a minimal core that could be distributed as a really simple server.js + package.json + Procfile that could go to github and get all the narratives it needs. Then that can go into a traditional git repo that we largely don't touch and then we work on everything else.