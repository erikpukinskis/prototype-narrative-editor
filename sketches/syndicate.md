Syndicate

Openings are listed of things that need doing in a project planning flow. This version of Syndicate has just one:

    opening.schedule('weekly', planning.refresh)

Planning.refresh refers to one of several planning processes:

    planning = {
      refresh: function() {
        planning.direction.brainstorm()
      },
      direction: {brainstorm: function() {
        say('Brainstorm possible outcomes to pursue. These could be features, improvements in numbers, a change in user experience, a workplace change.')
        ask.for.list('outcomes')
      }}
    }


Syndicates
----------

You just start changing things. If anyone in the syndicate is not on board with their changes, they fork the syndicate. Whichever party joined the syndicate later (by changing something) gets prompted to pick a different name for their syndicate, but they can type the same one back in and then there will just be two with that name (the system includes enough context to disambiguate things when that happens. ie. narrative (with ted) vs narrative (with erik) or maybe narrative (from '14)).

The same thing happens in the product planning tool. If you re-order things and someone un-does your ordering, you are prompted whether you want to seek consensus, fork, or go along. When the planning process is forked, developers are prompted to say whether they want to stick with the first, go to the second, or work off of both. If they choose to work off of both, they can decide what percentage of their time much they want to allocate to each queue.

You can also choose to follow other peoples' universes. If I follow Rob's Good Eggs universe, whenever there is a fork I will see which fork(s) are in his universe and which aren't, so I can choose if I want to ignore the stuff outside of it. Of coure I can still join those other syndicates and indicate a split.


Specification
-------------

Here's a mockup of the basics of consensus and forking:

~'~'~ erik:

 Write a story
-----------------------------------------

* * *

 Make ASCII mock up of Software+Consent
-----------------------------------------
 [ >Ask for this< ]

* * *

 Name this project
-----------------------------------------

 Write a story
-----------------------------------------

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

  Software+Consent
-----------------------------------------
  [ >Name this project< ]

  Write a story
-----------------------------------------

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent

  Write a story
-----------------------------------------

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ victor:

Erik created a new plan called Software+
Consent
[ >Join< ]

* * *

Software+Consent

  Write a story
-----------------------------------------

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ kynthia:

Erik created a new plan called Software+
Consent
[ >Join< ]

* * *

Software+Consent

  Write a story
-----------------------------------------

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent

  1 hour kwerk meeting
-----------------------------------------
  [ >Ask for this< ]

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ erik:

Software+Consent

┌--------------------------------------------┐
| Cook some bacon                            |
| * Kynthia added this                       |
| [ Start ] [ >Ignore< ]                     |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ kynthia:

Software+Consent

┌--------------------------------------------┐
| Cook some bacon                            |
|                                            |
| Erik ignored this                          |
| [ >Seek consensus< ] [ Start my own plan ] |
|                                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐ 
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent

┌--------------------------------------------┐
| Cook some bacon                            |
|                                            |
|  Bacon is tasty!                           |
| -------------------------------------      |
|  [ >Seek consensus< ]                      |
|                                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ erik:

Software+Consent

┌--------------------------------------------┐
| Cook some bacon                            |
|                                            |
| Kynthia says 'Bacon is tasty!'             |
|                                            |
|  Write a response                          |
| -------------------------------------      |
|                                            |
| [ Accept ] [ Ignore ] [ Mute]              |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make an ASCII mock up of consent+          |
| consensus+syndicates development           |
| [ Start ]                                  |
└--------------------------------------------┘

* * *

Software+Consent

┌--------------------------------------------┐
| Cook some bacon                            |
|                                            |
| Kynthia says 'Bacon is tasty!'             |
|                                            |
|  I just don't want any. I'd do a           |
| -------------------------------------      |
|  Kwerk meeting if you added it tho!        |
| -------------------------------------      |
| [ Accept ] [ >Ignore< ] [ Mute]            |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ kynthia:

Software+Consent

┌--------------------------------------------┐
| Cook some bacon                            |
|                                            |
| Erik says 'I just don't want any. I'd do a |
| Kwerk meeting if you added it tho!' and    |
| ignored this again                         |
| [ Seek consensus ] [ >Start my own plan< ] |
|                                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

  Name this project
-----------------------------------------

┌--------------------------------------------┐
| Cook some bacon                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

  Software+Consent+Bacon
-----------------------------------------
  [ >Name this project< ]

┌--------------------------------------------┐
| Cook some bacon                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent+Bacon

┌--------------------------------------------┐
| Cook some bacon                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ victor:

Software+Consent

Kynthia has forked this project as 
Software+Consent+Bacon. How would you like
to split your time?

Software+Consent:                     [ 50% v]
  ┌----------------------------------------┐
  | + Cook some bacon                      |
  └----------------------------------------┘
Software+Consent+Bacon:               [ 50% v]
[ >Split< ]

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent | Software+Consent+Bacon

┌--------------------------------------------┐
| Cook some bacon                            |
| [ Start ] [ Ignore ]                       |
└--------------------------------------------┘

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

~'~'~ erik:

Software+Consent

Kynthia has forked this project as Software+
Consent+Bacon. How would you like to split 
your time?

Software+Consent:       [ 100% v]
  ┌--------------------┐
  | + Cook some bacon  |
  └--------------------┘
Software+Consent+Bacon: [ 0% v]
[ >Split< ]

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
| [ Start ] [ Ignore]                        |
└--------------------------------------------┘

* * *

Software+Consent

┌--------------------------------------------┐
| Make ASCII mock up of Software+Consent     |
|                                            |
| You started this                           |
| [ Finish ] [ Ignore ]                      |
└--------------------------------------------┘
