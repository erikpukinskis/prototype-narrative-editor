Todo
----

 - [X] Commit when I click commit

Current medium-term goals are dogfooding and getting fine-grained feedback cycles between the editor and the running software.

I think it's an open question which we focus on first.


Dogfooding
----------

The lack of copy/paste is painful.

We have no way to keep a working server going while we work on changes. Everything gets reloaded continuously (it should be anyway).

The editor design also feels really cumbersome. I can't help but wonder if it would be simpler if implemented in a grid with fixed-width fonts. Is it worth an exploration? If we do it that way we can just use a textarea with fancy stuff overlaid/underlayed.

The component styles doc looks pretty good with Droid Sans Mono. Not as pretty as before though. I'm not sure how to implement the inline tests though. Maybe they can go off to the side? And I *suspect* that I can implment the typeface stuff as an underlayed div, but I'm not really positive. Then there's links, which are even harder. Although probably could be implemented as a hover? Maybe there just aren't any links in there. That seems sad though.

And honestly, the whole reason for heading down this path was that I think there needs to be really rich editing in code, and to use a much richer data structure than ASCII. With our own editor, the sky's the limit.

Plus, the Helvetica makes me really happy. And downloading webfonts sucks. One of the top goals for Narrative is Super Freaking Fast.

But how would we implement copy/paste? We do have the Clipboard API: http://datatables.net/blog/2014-01-31

And we have

  $(document).keypress/keydown(function(e) {
    if(e.which == 13) {
      // enter pressed
    }
  });


Feedback
--------

We have a nice sample for CSS definitions in Component Styles. That seems like a good place to get started, and we can scale out from there:

When we make a change:
 - eval all code blocks
 - see if test was defined. If so, grab the module and undefine it
 - send the HTML from the module down to the browser with a block id (means we need some concept of block ids)

After that:
 - pushing styles to the client
 - client-side js (similar to the former if we implement it as a js module)
 - client-side js (also similar potentially)
 - server-side libs (is already working, but we should do it without backticks?)
 - servers (same)
 - js tests (server-side? client-side?)


Working server design
---------------------

When we make a change:
 - which servers are live? load the freshest libs. reload them.
 - which servers are baked? load them on a different port with the fresh libs and mark those live

When we commit a change:
 - mark the lib baked.
 - which servers are baked? unload all the fresh libs. leave the committed ones. or go back to the db and get the most recently committed one. reload the servers.


Backlog
-------

 - [ ] Hot test running
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
