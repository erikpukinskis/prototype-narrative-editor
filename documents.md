Documents
---------

X `documents.js`:
`library documents.js
    define(['database', 'chain', 'chai', 'pg-escape', 'path'], function(database, chain, chai, escape, path) {
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

      function where(hash, callback) {
        var select = 'SELECT * FROM documents WHERE ' + hashToSqlWhereClause(hash)
        console.log(select)
        database.query(select, function(data) {
          callback(data.rows)
        })
      }

      function unescapeSlashes(string) {
          var forwardSlashPattern = /\\\//g
          return string.replace(forwardSlashPattern, '/')
      }

      function hashToSqlWhereClause(hash) {
        for (key in hash) {
          var regexpString = hash[key].source
          var like = unescapeSlashes(regexpString)
          like = '%'+like+'%'

          var beginningOfStringPattern = /^%\^/
          var endOfStringPattern = /\$%$/

          like = like.replace(beginningOfStringPattern, '')
          like = like.replace(endOfStringPattern, '')

          return escape('%I LIKE %L', key, like)
        }
      }

      hashToSqlWhereClause.test = function() {
        // makes a nice LIKE clause
        var clause = hashToSqlWhereClause({name: /bird/})
        expect(clause).to.equal("name LIKE '%bird%'")

        // unescapes forward slashes
        clause = hashToSqlWhereClause({name: /path\//})
        expect(clause).to.equal("name LIKE '%path/%'")

        // sticks to the beginning or end as necessary
        clause = hashToSqlWhereClause({name: /^start/})
        expect(clause).to.equal("name LIKE 'start%'")

        clause = hashToSqlWhereClause({name: /end$/})
        expect(clause).to.equal("name LIKE '%end'")

        console.log("wowza!")
      }

      hashToSqlWhereClause.test()


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
          function (characters, f) {
            expect(characters).to.equal("'\"?")
            console.log('yahooee.')
            f()
          },
          function getTwoThatMatch(f) {
            set('i am a pig', 'too', function() {
              where({key: /^i am/}, f)
            })
          },
          function expectListOfOne(list, xxxx) {
            expect(list.length).to.equal(2)
            expect(_(list).pluck('key')).to.have.members(['i am', 'i am a pig'])
            console.log('searcheeeeeeeed!')
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
        if (!name) { return doTheNextThing() }

        if (request.method == "POST") {
          console.log("Saving", name, "via the documents api")
          set(name, request.body)
          response.send('ok!')
        } else {
          console.log("Getting", name, "from the documents api")
          get(name, function(document) {
            response.contentType(path.basename(name))
            response.send(document)
          })
        }
      }

      return {get: get, set: set, where: where, test: test, api: api}
    })

