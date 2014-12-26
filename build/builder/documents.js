define(['database', 'chain', 'chai', 'pg-escape'], function(database, chain, chai, escape) {
  var expect = chai.expect

  function set(key, value, callback) {
    var json = JSON.stringify(value)
    console.log('Setting', key)
    var update = escape('UPDATE %I SET value = %L WHERE key = %L', 'documents', json, key)
    var insert  = escape('INSERT INTO %I (key, value) VALUES (%L, %L)', 'documents', key, json)

    get(key, function(found) {
      var query = found ? update : insert
      database.query(query, function(data) {
        var rowCount = JSON.parse(data && data.rowCount)
        console.log('Saved ', key, ' - ', rowCount, 'row')
        if (callback) { callback(rowCount) }
      })
    })
  }

  function get(key, callback) {
    var select = database.select('*').from('documents').where({key: key}).toQuery()
    database.query(select, function(data) {
      value = data.rows[0] && data.rows[0].value
      if (value) { value = JSON.parse(value) }
      callback(value)
    })
  }

  function test() {
    console.log('testing')

    chain(
      function setLost(f) { 
        set('i am', {is: 'lost'}, f) 
      },
      function getState(rowCount, f) {
        console.log('--------returned from "i am" set. inserted', rowCount)
        get('i am', f)
      },
      function setFound(value, f) {
        console.log('$$$$$ back from getting "i am". Value was ' + JSON.stringify(value))
        console.log('i am', value.is)
        set('i am', {is: 'found'}, f)
      },
      function getStateAgain(rowCount, f) {
        console.log('inserted', rowCount)
        get('i am', f)
      },
      function setEmptyObjec(value, f) {
        console.log('now i am', value.is)
        set('one more', {}, f)
      },
      function overwriteEmptyObject(f) {
        set('one more', {is: 'this other shit'}, f)
      },
      function getStateOneMoreTime(f) {
        get('i am', f)
      },
      function expectStateIsFound(value, f) {
        console.log('now i am', value.is)
        expect(value.is).to.equal('found')
        f()
      },
      function saveQuotesAndQuestionMarks(f) {
        set('weirdCharacters', "'\"?", f)
      },
      function getThemBack(rows, f) {
        get('weirdCharacters', f)
      },
      function (characters, xxxx) {
        expect(characters).to.equal("'\"?")
        console.log('yahooee.')
      }
    )
  }

  function nameFromRequest(request) {
    var pattern = /^\/documents\/([a-z\/.]+)$/
    var partsOfTheAddress = request.url.match(pattern)
    if (!partsOfTheAddress) { return }
    return partsOfTheAddress[1]        
  }

  // Ideally this would be automatically generated from the narrative.
  // Like documents provides set and get, it would also provide verbs
  // and the arguments would be become querystring or POST parameters.
  var api = function(request, response, doTheNextThing) {
    var name = nameFromRequest(request)
    if (!name) { doTheNextThing() }

    if (request.method == "POST") {
      console.log("Saving", name, "via the documents api")
      set(name, request.body)
      response.send('ok!')
    } else {
      console.log("Getting", name, "from the documents api")
      get(name, function(document) {
        response.send(document)
      })
    }
  }

  test()
  return {get: get, set: set, test: test, api: api}
})

