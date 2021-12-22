const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const User = require('../models/userModel');
const QnA = require('../models/qnaModel');


function get_rank(email) {
  return new Promise(function (resolve, reject) {
    leaderboard_data = [];
    itr = 0;

    User.find()
      .sort({ score: -1, last_write: 1 })
      .exec(function (err, result) {
        if (err) throw err;
        var userrank = 0;
        while (itr < result.length) {
          if(result[itr].score > 0){
          leaderboard_data.push({'name':result[itr].username,'score':result[itr].score});
          }
          if (email == result[itr].email) {
            userrank = itr + 1;
          }
          itr++;
        }
        resolve(userrank);
        return;
      });
  });
}

router.get('/', function (req, res, next) {
  res.render('landing', { layout: 'layout_static' });
});

router.get('/404redirect', function (req, res, next) {
  if(req.isAuthenticated()){
    res.redirect('/home');
  }
  else{
    res.redirect('/');
  }
});

router.get('/login', function (req, res, next) {
  res.redirect('/auth/google');
});

router.get('/signup', function (req, res, next) {
  res.render('', { layout: 'register' });
});

router.get('/home', function (req, res, next) {
  if(req.isAuthenticated() && req.user.username != ""){
    if(req.session.type=='login'){
      req.session.type='';
      res.render('home', { func: 'login_successful()', layout: 'layout_static' });
    }
    else if(req.session.type=='register'){
      req.session.type='';
      res.render('home', { func: 'register_successful()', layout: 'layout_static' });
    }
    else{
    res.render('home', { layout: 'layout_static' });
    }
  }
  else{
  res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
  }
});

router.get('/failure', function (req, res, next) {
  res.render('landing', { func: 'register_fail()', layout: 'layout_static', error: req.flash("error")});
});

router.get('/profile', async function (req, res, next) {
  try{
    if(!req.isAuthenticated() || req.user.username == ""){
      return res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }
    const email = req.session.email;
    const user = await User.findOne({ email });
    var name;
    if(user.last_name == undefined){
      name = user.first_name ;
    }
    else{
    name = user.first_name +' '+ user.last_name ;
    }
    const uname = user.username;
    const rank = await get_rank(req.session.email);
    res.render('profile',{  
        layout: 'layout_empty',
        Name: name,
        Rank: rank,
        User_Id: uname,
        Email: req.session.email,
        Score: req.session.score
      });
  }
  catch(e){
    next(e);
  }
});

// register new user
router.post('/getusername', async function (req, res, next) {
  try{
    if(!req.isAuthenticated()){
      return res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }
    const { username } = req.body;
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(format.test(username) || username.toLowerCase().includes("admin") || username==""){
      req.logout();
      return res.render('', { func: 'invalid_username()', layout: 'landing' });
    }
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.render('', { func: 'exists()', layout: 'register' });
    }
    else{
     const user = await User.findOne({ email: req.user.email });
     if(user.username!=""){
       req.session.type='';
       res.redirect('/home');
     }
     else{
      await User.updateOne({"email": req.user.email},{$set: { "username" : username}});
      req.session.type = 'register';
      req.session.email = req.user.email;
      req.session.level = req.user.level;
      req.session.score = req.user.score;
      req.session.save();
      res.redirect('/home');
     }
    }
}
catch(e){
  next(e);
}

});

// // route to load questions in database
// // requires questions.js file,answer[],close_ans[]
// router.get('/loadquestions', async function (req, res, next) {
//   const noOfQuestions = 14;
//   for (i = 0; i < noOfQuestions; i++) {
//     const newQuestion={
//       ...questions[i],
//       answer: answer[i],
//       close_ans: close_ans[i]
//     }
//     await QnA.create(newQuestion);
//   }
//   res.send("loaded");
// });

//leaderboard
router.get('/leaderboard', async function (req, res, next) {
  try{
    if(!req.isAuthenticated() || req.user.username == ""){
      return res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }
    const email = req.session.email;
    const user = await User.findOne({ email });
    req.session.level = user.level;
    const uname = user.username;
    const rank = await get_rank(req.session.email);
    console.log('rank is :', rank);
    // console.log('THE LEADERBOARD DATA:', leaderboard_data);
    res.render('leaderboard', {
      layout: 'layout_empty',
      Rank: rank,
      User_Id: uname,
      My_score: req.session.score,
      lb_data: leaderboard_data
    });
}
catch(e){
  next(e);
}
});

module.exports = router;
