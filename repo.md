! Repo

In `repo.js`:

    define('repo', ['chai', 'underscore'], function(chai, _) {
      var expect = chai.expect

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
          repo.loadAs("commit", headHash, function(error, commit) {
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
          var contents = repo.loadAs("text", tree[path].hash, function(error, contents, foo) {
            callback(contents)
          })
        })
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

      test()
      return Repo
    })

Next up we want to be able to save a commit.

The easiest thing would be (a) to just have a commit button there, and you can hit it whether or not there are any changes. 

That said, it would be really nice to be able to change state at the UI level depending on dirtiness. 

We could just (b) mark documents with a dirty boolean whenever we change and clear it whenever we commit. But that mixes the concerns of document storage and dirtiness awareness. Just because data is keyed by document, is that reason enough to keep it in the same store?

Maybe we (c) write to a separate collection? /dirty-narratives/narrative = true That's pretty stateful though. 

Maybe we just (d) log commits and hashed documents and if there isn't a commit for the hash we know it's dirty? For that to work we'd have to hash the file and log the commit when we load from the db. That seems fairly complex. That said, I guess it could be hid behind Repo.get.

It also feels a little weird that none of the document storage is happening relationally. I wonder if we shouldn't have the document store be more like:

Line
id: 'df1'
text: 'define(function() {'
narrative: 'repo'
block: 'repo.js'
order: 1000

Potentially then you are just updating single lines. The alternative would be to organize things as changes. The nice thing about that is you can have an immutable store.

It does really feel like this is totally separate information, about the repo and not about the core document, and storing on the core document just feels bad. (d) feels like the most correct from a domain modelling perspective. It introduces a little weirdness in that we have to think about hashing documents, but maybe at first the presence/absence of a github-provided hash is all we really need to worry about. If in the future we want hashes of intermediate documents we can worry about that then.

! Next features

    server.post('/narratives/:name', function(request, response) {
      ...
      repo.onFileChange(name +'.md', markdown)
    })

Then maybe it's as simple on the client as:

    define(['repo'], function(repo) {
      repo.components.commit.bind('#commit', 'erikpukinskis/narrative')
    })

