Running it on your own computer
-------------------------------

So those are some snippets of code to run. But some human intervention is necessary for that to actually happen. Like, real computers need to be on in the real world in a closet somewhere.

Here's how.

You'll need to install [Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer. Then open a terminal and run:

  git clone https://github.com/erikpukinskis/narrative.git
  cd narrative

That will put you into a folder that has this very document (README.md) and the a file called compile.js, which was generated from the [compiler.md](compiler.md) narrative¹.

That narrative will actually read a narrative file, and write out a javascript file that can actually be run on your computer to start the server! You do that like this:

  node compile.js

That also will spit out all the files described in the narrative. So now if you type:

  ls ../narrative-build

... you'll see styles.css, edit.html, and all of the other files we described above! Neat! 

In order to start the server you just do:

  cd ../narrative-build
  npm install
  node server.js

Now open up [http://localhost:5000](http://localhost:5000) in your web browser and you should see your copy of this narrative! Cool! That's a legit web server running on your computer.

Try changing some text in the README.md and running "node compile.js" and "node server.js" again, reload your browser and you should see your changes!

Putting it on the intarwebs
---------------------------

Now, in order to get it on the web so that the whole world can see it, we need to deploy it to Heroku. Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and create a git repository that will keeps track of your code:

    git init

We need to do that because git is what we use to actually send all of this stuff to Heroku. Save the files we just built into the repository:

    git add .
    git commit -m "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever-you-want-to-call-this

You'll have to choose a name of your own. And then finally "push" the code to Heroku, so they can set it up on the web:

    git push heroku master
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to <http://whatever-you-want-to-call-this.herokuapp.com>, or whatever you called it.
