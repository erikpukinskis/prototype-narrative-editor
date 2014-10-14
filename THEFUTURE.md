! Future Future Future Future

There's some stuff to clean up to get back to feature parity with 0.2.0.

 - [X] Type Narrative into itself
 - [X] Get Narrative typed in to save, reload, and run a hello world
 - [X] Load .md files if there's nothing in the db
 - [X] Replaced Ember with a bunch of stuff inlined with the very beginnings of a framework
 - [ ] Get to featuer parity with the Ember version
 - [ ] Get the loaded-from-disk narrative to go through the loader
 - [ ] Tidy up

And that'll be 0.3.0, "Self hosting without touching the filesystem". Not pretty. But this is 0.x.

At 0.4 we're probably on feature dot releases for a while:

 - [ ] Use the CSS files from the live Narrative
 - [ ] Typed in CSS file can bootsrap and edits go into the 2nd generation
 - [ ] Typed Narrative and Narrative on disk are one in the same. They work alike whether built or loaded.
 - [ ] Add the features we need to actually make these narratives read well
 - [ ] getDependencies should go straight to searchLine. We should just join the blocks together into a string in build
 - [ ] Automatically compile dependencies of dependencies so narrative doesn't have to require jquery and database and such

There are a few things that could be O.x versions:

 - [ ] Export to github. Push to Heroku. Then we are truly free. https://github.com/creationix/js-git
 - [ ] Multi-user
 - [ ] Running narratives in a secure jail
 - [ ] Basic quota system

At that point you are basically tethered into the open internet. Essentially I broadcast a cloud workspace that you can duplicate with the click of a mouse, and fork onto hardware you own by pasting a git url and an SSH key. 1.0.
