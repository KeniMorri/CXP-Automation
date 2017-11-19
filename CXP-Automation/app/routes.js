var Login = require('../private/login.js');
var Log = require('../log.js');

module.exports = function(app) {
  app.get('/', function(req, res) {
    //console.log(currDate);
    res.render('index.ejs', {
      user: Login.login
    }); // load the index.ejs file
  });
  app.get('/legacyIndex', function(req, res) {
    //console.log(currDate);
    res.render('legacyIndex.ejs'); // load the index.ejs file
  });

  app.get('/advMeal', function(req, res) {
    //console.log(currDate);
      res.render('advMeal.ejs');
  });

  app.get('/advMaterial', function(req, res) {
    //console.log(currDate);
      res.render('advMaterial.ejs');
  });

  app.get('/specialMealChecker', function(req, res) {
    //console.log(currDate);
      res.render('specialMealChecker.ejs');
  });

  app.get('/pilotMealChecker', function(req, res) {
    //console.log(currDate);
      res.render('pilotMealChecker.ejs');
  });

  app.get('/statusChanger', function(req, res) {
    //console.log(currDate);
      res.render('statusChanger.ejs');
  });
  app.get('/utility', function(req, res) {
    //console.log(currDate);
      res.render('utility.ejs');
  });
  app.get('/getReports', function(req, res) {
    //console.log(currDate);
      res.render('getReports.ejs');
  });


  app.get('/loginChange', function(req, res) {
    //console.log(currDate);
      res.render('loginChange.ejs');
  });
  app.post('/loginChange', function(req,res) {
    console.log(req.body.login);
    console.log(req.body.password);
    Log.initOverride('./private/login.js')
    Log.statement('module.exports = {');
    Log.statement("\t'login' : '" +  req.body.login + "',");
    Log.statement("\t'password' : '" + req.body.password + "'");
    Log.statement("};")
    res.redirect('/');
  });
}