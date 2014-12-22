

OK, so Narrative can reload itself. That basically means we can start to dogfood. Although we are missing the ability to export that stuff back out to disk.

The next big research thing is setting up the infrastructure for propagating events through the dependency tree. Part of me thinks I should set up test running, because then I'll have UI, server loading, and test running examples and it seems like a event system that can handle all of that would be pretty robust. That said, the test running is really only a special case of the server running and UI stuff. Especially if we do hot reloading.

So, possible features:

 - Hot test running
 - Hot reload of css
 - Hot reload of UI
 - Hot reload of client libs
 - Change propagation framework
 - Export to github. Push to Heroku. Then we are truly free. https://github.com/creationix/js-git
 - Load deps from db after restart
 - Actually make the narratives read well (nested comments? copy/paste?)
 - Find dependencies of dependencies
 - Multi-user
 - Running narratives in a secure jail
 - Basic quota system

At that point you are basically tethered into the open internet. Essentially I broadcast a cloud workspace that you can duplicate with the click of a mouse, and fork onto hardware you own by pasting a git url and an SSH key. 1.0.
