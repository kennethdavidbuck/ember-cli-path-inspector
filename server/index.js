module.exports = function(app) {
  app.get('/ember-cli-path-inspector/docs', function(req, res){
    res.redirect('/ember-cli-path-inspector/docs/index.html');
  });
};
