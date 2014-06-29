sun champ
---------

This is a sample narrative. It was translated from this natural language description:

> today i am making my first blog. i want the blog to be the color blue, and have little yellow dasies all over. i want the website to have all of my photos from my trip to new mexico, which are located in the file on my comuter tittled "trip"

Here that is in javascript:

    library.give('sun-champ', function(blog, photos, random) {
      blog.set('color', 'blue')
      blog.add.picture('yellow_daisys.jpg', {position: random(), size: 'small'})
      blog.add.album(
        photos('http://flickr.com/sunchamp/new+mexico+trip')
      )
    )

The hope is that eventually that will actually work within the Narrative world.

Here's another one, for a game:

    library.give('legendofhelga', function(forest, creatures, helga, let) {
      repeat(four, function() {
        lion = creatures.beget('lion')
        lion.enter(forest)
      })

      forest.weather('lightning and thunder under a black sky and a full moon')

      helga.enter(forest)
      let.user.control(helga)
    }

