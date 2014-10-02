Narrative
---------

Narrative lets you write code the way you'd write stories. It encourages you to break the different parts of a big application into self-contained, self-explanatory chunks, and arrange those chunks in sequence, like chapters in a book.

This repository contains a dozen or so different narratives that do everything from saving files to setting up a code editor in the web browser.

Two of those narratives are special because they provide commands you can run on your computer:

**Narrative**, the tool for editing and running software narratives, described in [narrative.md](narrative.md).

**Builder**, the tool that reads a narrative and compiles it into a form that can be deployed to Heroku. That's in [builder.md](builder.md).

Running it on your own computer
-------------------------------

You'll need to install [Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer. Then open a terminal and run:

    git clone https://github.com/erikpukinskis/narrative.git
    cd narrative

That will put you into a folder that has this document and all of the narratives you'll need. It also has a pre-built narrative builder in build/builder. In order to build narrative, run:

    cp build/builder/package.json .
    npm install
    node build/builder/builder.js narrative

That will write all the files described in [narrative.md](narrative.md) into build/narrative. It also builds into there all of the other narratives that narrative depends on. So now if you type:

    ls build/narrative

... you'll see styles.css, edit.html, and all of the other files! Neat! 

In order to start the server you just do:

    cd build/narrative
    npm install
    foreman start

Now open up [http://localhost:5000/myserver](http://localhost:5000/myserver) in your web browser and you should see the editor. Try typing this in:

    ! My Server
    This code will go into `center.js`:
        define('myserver', function() {
          console.log('hi!')
        })

Note that you need to press tab to indent the "define" line, but then use spaces to indent further. 

Once you get it typed in, you should see the "hi!" message printed out in your terminal. That's your server starting up inside the narrative server. Pretty neat!

Putting it on the intarwebs
---------------------------

Now, in order to get it on the web so that the whole world can see it, we need to deploy it to Heroku. Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and create a git repository that will keeps track of your code by running this in your narrative-build folder:

    git init

We need to do that because git is what we use to actually send all of this stuff to Heroku. Save the files we just built into the repository:

    git add .
    git commit -m "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever-you-want-to-call-this

You'll have to choose a name of your own. And then finally "push" the code to Heroku, so they can set it up on the web:

    git push heroku master
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to <http://whatever-you-want-to-call-this.herokuapp.com>, or whatever you called it.