Documents
---------

`documents.js`:

    define(['database', 'chain', 'assert', 'pg-escape'], function(database, chain, assert, escape) {

      function set(key, value, callback) {
        var json = JSON.stringify(value)
        var update = escape('UPDATE %I SET value = %L WHERE key = %L', 'documents', json, key)
        var insert  = escape('INSERT INTO %I (key, value) VALUES (%L, %L)', 'documents', key, json)

        get(key, function(found) {
          var query = found ? update : insert
          database.query(query, function(data) {
            console.log('+ set', data && data.rowCount, 'with', query)
            if (callback) { callback(JSON.parse(data && data.rowCount)) }
          })
        })
      }

      function get(key, callback) {
        var select = database.select('*').from('documents').where({key: key}).toQuery()
        database.query(select, function(data) {
          value = data.rows[0] && data.rows[0].value
          console.log('back from select. Got value ' + value)
          if (value) { value = JSON.parse(value) }
          console.log("<- got", value, 'from', select)
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
          function assertStateIsFound(value, f) {
            console.log('now i am', value.is)
            assert.equal(value.is, 'found', 'overwrote "i am"')
            console.log('wee!!')
            f()
          },
          function saveQuotesAndQuestionMarks(f) {
            set('weirdCharacters', "'\"?", f)
          },
          function getThemBack(rows, f) {
            get('weirdCharacters', f)
          },
          function (characters, xxxx) {
            assert.equal(characters, "'\"?")
            console.log('yahooee.')
          }
        )

        console.log('done')
      }

      var api = function(request, response, doTheNextThing) {
        console.log("BEING USED!")
        var pattern = /^\/documents\/([a-z\/.]+)$/
        var partsOfTheAddress = request.url.match(pattern)
        if (!partsOfTheAddress) { return doTheNextThing() }
        var name = partsOfTheAddress[1]
        get(name, function(document) {
          response.send(document)
        })
      }

      return {get: get, set: set, test: test, api: api}
    })

