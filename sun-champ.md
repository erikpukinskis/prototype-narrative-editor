sun champ
---------

today i am making my first blog. i want the blog to be the color blue, and have little yellow dasies all over. i want the website to have all of my photos from my trip to new mexico, which are located in the file on my comuter tittled "trip"

    library.give('sun-champ', function(blog, photos) {
      blog.set('color', 'blue')
      blog.add.picture('yellow_daisys.jpg', {position: random(), size: 'small'})
      blog.add.album(
        photos('http://flickr.com/sunchamp/new+mexico+trip')
      )
    )
