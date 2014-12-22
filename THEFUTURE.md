! Right now

Some weirdness with enter and backspace. Not sure what it is. Maybe it's not blocking then. Onward to the hard stuff! Loader! Bootstrapping!

! Future Future Future Future

There's some stuff to clean up to get back to feature parity with 0.2.0.

 - [X] Get back to feature parity with the Ember editor
 - [X] Broken libs don't crash server
 - [X] Use JSON instead of querystring for save format
 - [X] Fix "port in use" error on Narrative save
 - [X] Narrative can restart itself from a web request
 - [X] Make it so Narrative can load from Procfile even with a name (define('narrative', ...))
 - [X] When you edit editor.md it gets reloaded in the client
 - [X] Use the CSS files from the live Narrative
 - [X] Typed in CSS file can bootsrap and edits go into the 2nd generation
 - [X] Typed Narrative and Narrative on disk are one in the same. They work alike whether built or loaded.

And that'll be 0.3.0, "Self hosting without touching the filesystem". Not pretty. But this is 0.x.

At 0.4 we're probably on feature dot releases for a while:

 - [ ] Export to disk/git
 - [ ] Load deps from db after restart
 - [ ] Add the features we need to actually make these narratives read well
 - [ ] getDependencies should go straight to searchLine. We should just join the blocks together into a string in build
 - [ ] Automatically compile dependencies of dependencies so narrative doesn't have to require jquery and database and such

There are a few things that could be O.x versions:

 - [ ] Export to github. Push to Heroku. Then we are truly free. https://github.com/creationix/js-git
 - [ ] Multi-user
 - [ ] Running narratives in a secure jail
 - [ ] Basic quota system

At that point you are basically tethered into the open internet. Essentially I broadcast a cloud workspace that you can duplicate with the click of a mouse, and fork onto hardware you own by pasting a git url and an SSH key. 1.0.
