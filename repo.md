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

      Repo.prototype.list = function(callback) {
        var repo = this.repo

        repo.readRef("refs/heads/master", function(error, headHash) {          
          repo.loadAs("commit", headHash, function(error, commit) {
            repo.loadAs("tree", commit.tree, function(error, tree) {
              callback(_(tree).keys())
            })
          })
        })
      }

      function test() {
        var repo = new Repo('erikpukinskis/narrative', process.env.GITHUB_TOKEN)
        repo.list(function(paths) {
          expect(paths).to.contain('README.md')
          console.log(('waheeee'))
        })
      }

      test()
      return Repo
    })

Next features:

    repo.getContent(paths[0])

    server.use repo.middleware()

    server.post('/narratives/:name', function(request, response) {
      ...
      repo.onFileChange(name +'.md', markdown)
    })

Then maybe it's as simple on the client as:

    define(['repo'], function(repo) {
      repo.components.commit.bind('#commit', 'erikpukinskis/narrative')
    })

