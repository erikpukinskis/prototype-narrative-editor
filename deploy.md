Running it on your own computer
-------------------------------

You'll need to install [Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer. Then open a terminal and run:

  git clone https://github.com/erikpukinskis/narrative.git
  cd narrative

That will put you into a folder that has a bunch of narratives in Markdown form (.md files). There are two that are particularly important: Narrative, which loads the narrative host and editor and everything, and Builder, which takes .md files and builds them into files that you can actually run.

You can build a fresh copy of Builder by running this:

  node build/builder-baked/builder.js builder

Then you can build Narrative like this:

  node build/builder/builder.js narrative

That will put a bunch of files into build/narrative. You can go into there and see all the files by doing:

  cd build/narrative
  ls

There are mostly javascript files in there, some HTML and CSS,but there is also a Procfile that tells Forman how to start the server and a package.json that lets NPM know what packages to install and such. You can start everything up like this:

  npm install
  foreman start

Now open up [http://localhost:5000](http://localhost:5000) in your web browser and you should Narrative display itself! You can try editing the HTML, and it should spin up your modified version of Narrative at [http://localhost:5100](http://localhost:5100). You can also look in [test/hello.md](test/hello.md) for a "hello world" example that you can type in at [http://localhost:5000/hello](http://localhost:5000/hello).

Putting it on the intarwebs
---------------------------

In order to get it on the web so that the whole world can see it, you need to deploy it to Heroku. Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and create a git repository that will keeps track of your code by running this in build/narrative folder:

    git init

We need to do that because git is what we use to actually send all of this stuff to Heroku. Save the files we just built into the repository:

    git add .
    git commit -m "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever-you-want-to-call-this

You'll have to choose a name of your own. And then finally "push" the code to Heroku, so they can set it up on the web:

    git push heroku master
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to <http://whatever-you-want-to-call-this.herokuapp.com>, or whatever you called it.