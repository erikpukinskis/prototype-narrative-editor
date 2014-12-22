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