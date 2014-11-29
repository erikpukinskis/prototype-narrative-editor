! Right now

There are some weird bugs with the editor. I am wondering if it's a symptom of me doing everything procedurally, and if it's time to start working on a declarative binding-based setup of some kind. One alternative is to try to centralize the procedural stuff better so the data model is less likely to have synchronization bugs. Or I can just keep going and wait to see what patterns emerge.

I started writing a declarative Node class, but it's not working, and it's not super straightforward to write and I am wondering if it wouldn't be a smoother approach to let it grow organically by picking a single job in the existing code for it to take over, and slowly growing its responsibilities.

It's also relevant that I'm still not yet back to feature parity with 0.2.0, which is not even particularly useful in itself. That makes it feel like I'm doing a bad job at incrementalism.

Still, I think my philosophy on this project has been to not try to do too much, feature-wise, but to really take my time to work on the architecture and the data model, since that's really the whole point. That's what makes me think it's ok to spend so much time in the wilderness.

That said, I don't really see a clear path forward with the declarative stuff, besides just patching in a bunch of refactors and hoping for the best. Right now, the kind of setup I would build is pretty much exactly what Ember would do (an ArrayController with a view hierarchy, basically). But the reason I don't want to use an Ember model, is because I'm hoping it will be useful to have tighter integration with the concept of a narrative at some point. I kind of want to wait and see what building blocks emerge and how they need to communicate before I really work on the declarative model. So I think for now I'm just going to keep working on behavior and keep an eye out for possible centralization.

! Future Future Future Future

There's some stuff to clean up to get back to feature parity with 0.2.0.

 - [X] Type Narrative into itself
 - [X] Get Narrative typed in to save, reload, and run a hello world
 - [X] Load .md files if there's nothing in the db
 - [X] Replaced Ember with a bunch of stuff inlined with the very beginnings of a framework
 - [X] Autoscroll
 - [ ] Get back to feature parity with the Ember editor
   - [X] Get tabbing working again
   - [X] Enter on the first line
   - [ ] Fix backspace key
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
