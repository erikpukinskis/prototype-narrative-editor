! Repo

In `repo.js`:
`library repo.js
    define('repo', ['chai', 'underscore'], function(chai, _) {
      var expect = chai.expect
      var modes = require('js-git/lib/modes')

      function Repo(githubName, githubToken) {
        var repo = this.repo = {}
        require('js-github/mixins/github-db')(repo, githubName, githubToken)
        require('js-git/mixins/create-tree')(repo)
        require('js-git/mixins/mem-cache')(repo)
        require('js-git/mixins/read-combiner')(repo)
        require('js-git/mixins/formats')(repo)
      }

      function withTree(repo, callback) {
        if (repo.tree) { return callback(repo.tree) }
        repo.readRef("refs/heads/master", function(error, headHash) {
          repo.headHash = headHash
          repo.loadAs("commit", headHash, function(error, commit) {
            if (error) { throw error }
            repo.headCommit = commit
            repo.loadAs("tree", commit.tree, function(error, tree) {
              callback(repo.tree = tree)
            })
          })
        })
      }

      Repo.prototype.list = function(callback) {
        withTree(this.repo, function(tree) {
          callback(_(tree).keys())
        })
      }

      Repo.prototype.get = function(path, callback) {
        var repo = this.repo
        withTree(repo, function(tree) {
          if (!tree[path]) {
            return callback()
          }
          hash = tree[path].hash
          var contents = repo.loadAs("text", hash, function(error, contents, foo) {
            callback(contents, hash)
          })
        })
      }

      Repo.prototype.commit = function(changes, message, callback) {
        var blobsLeft = _(changes).size()
        var updates = []
        var repo = this.repo

        withTree(repo, function() {
          for(path in changes) {
            updates.push({
              path: path,
              mode: modes.blob,
              content: changes[path]
            })
          }

          updates.base = repo.headCommit.tree
          repo.createTree(updates, saveCommit)
        })

        function saveCommit(error, treeHash) {
          var commit = {
            author: {
              name: 'Erik Pukinskis',
              email: 'erik@snowedin.net'
            },
            tree: treeHash,
            parent: repo.headHash,
            message: message
          }
          repo.saveAs('commit', commit, pointMasterAtHash)
        }

        function pointMasterAtHash(error, hash) {
          repo.updateRef('refs/heads/master', hash, function(error) {
            if (error) { throw error }
            callback(hash)
          })
        }
      }

      function test() {
        var repo = new Repo('rmccue/test-repository', process.env.GITHUB_TOKEN)

        repo.list(function(paths) {
          expect(paths).to.contain('README')
          console.log(('waheeee'))

          repo.get('README', function(contents) {
            expect(contents).to.equal('This is just a test repository to work with Git commands.')
            console.log('whoooo')
          })
        })
      }

      return Repo
    })

! Next features

    server.post('/narratives/:name', function(request, response) {
      ...
      repo.onFileChange(name +'.md', markdown)
    })

Then maybe it's as simple on the client as:

    define(['repo'], function(repo) {
      repo.components.commit.bind('#commit', 'erikpukinskis/narrative')
    })

