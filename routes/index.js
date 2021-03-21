const express = require('express');
const router = express.Router();
const questions = require('./questions');
const MongoClient = require('mongodb').MongoClient;
const store = require('store');
const User = require('../models/userModel');
const Answer = require('../models/answerModel');
var answer = [
  'on',
  '14159265',
  'love',
  'easy',
  'terminate',
  'halloween',
  'radio',
  'finale',
  'hemingway',
  'greenharmony',
  'crypted',
  'stevebuscemi',
  'depression',
  'enigma'
];
var close_ans = [
  [],
  ['14','141'],
  [],
  [],
  [],
  [],
  [],
  [],
  ['mojito'],
  ['monet','thewaterlilypond'],
  [],
  [],
  ['ungdomshuset'],
  []
];

async function update_score(req, email, score) {
  const user = await User.findOne({ email });
  user.score = score;
  user.level=req.session.level;
  user.save();
}

function get_rank(email) {
  return new Promise(function (resolve, reject) {
    leaderboard_data = [];
    itr = 0;

    User.find()
      .sort({ score: -1, updatedAt: 1 })
      .exec(function (err, result) {
        if (err) throw err;
        var userrank = 0;
        while (itr < result.length) {
          if (itr < 20) {
            leaderboard_data.push({'name':result[itr].username,'score':result[itr].score});
          }
          if (email == result[itr].email) {
            userrank = itr + 1;
          }
          if (itr >= Math.min(20, result.length) - 1 && userrank != 0) {
            resolve(userrank);
            return;
          }
          itr++;
        }
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
  store.set('type','login');
  res.redirect('/auth/google');
});

router.get('/signup', function (req, res, next) {
  res.render('', { layout: 'register' });
});

router.get('/home', function (req, res, next) {
  if(req.isAuthenticated()){
    if(store.get('type')=='login'){
      store.clearAll();
      res.render('home', { func: 'login_successful()', layout: 'layout_static' });
    }
    else if(store.get('type')=='register'){
      store.clearAll();
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
  if(!req.isAuthenticated()){
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
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
});

// register new user
router.post('/getusername', async function (req, res, next) {
  const { username } = req.body;
  const userExists = await User.findOne({ username });
  store.set('type','register');
  if (userExists) {
    res.status(400);
    res.render('', { func: 'exists()', layout: 'register' });
  }
  else{
    store.set('id',username);
    res.redirect('/auth/google');
  }

});

// //only for testing, to be included in play once date is finalized
// router.get('/countdown',function (req, res, next) {
//   if(req.isAuthenticated()){
//     res.render('', {layout:'countdown'});
//   }
//   else{
//     res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
//     }
// });
// //only for testing, to be included in play once date is finalized
// router.get('/end',function (req, res, next) {
//   if(req.isAuthenticated()){
//     res.render('end', {layout:'play_layout'});
//   }
//   else{
//     res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
//     }
// });


router.get('/play', async function (req, res, next) {
  if(req.isAuthenticated()){
    //to be used for countdown and finish page
    var curDateTime = new Date();
    var end=new Date("2021-03-23T00:29:57+05:30");
    var start=new Date('2021-03-20T19:44:57+05:30');
    //console.log(curDateTime.getTime() < start.getTime());
    if(curDateTime.getTime() > end.getTime()){
      res.render('end', {layout:'play_layout'});
    }
    else if(curDateTime.getTime() < start.getTime()){
      res.render('', {layout:'countdown'});
    }
    console.log('CURRENT LEVEL', req.session.level);
    // for completion
    if(Math.min(...req.session.level)>14){
      res.render('complete', {text:"Congrats! You completed Enigma.",layout:'play_layout'});
    }
    let last = false;
    if(req.session.level.length == 2){
      const q1_index=req.session.level[0];
      const q2_index=req.session.level[1];
      let q1 = questions[q1_index - 1];
      let q2 = questions[q2_index - 1];
      if(q2_index>14){
        last=true;
      }
      var done={q1: false, q2:false};
      res.render('index',{q1, q2, active:{q1: true}, last, done, layout:'play_layout'});
    }
    else if(req.session.level.length == 1){
      const cur_ques = req.session.level[0];
      var done={q1: false, q2:false};
      var active={q1: true};
      var q1_index;
      var q2_index;
      if(cur_ques&1){
        done.q2=true;
        active.q1=true;
        q1_index=cur_ques;
        q2_index=cur_ques+1;
      }
      else{
        done.q1=true;
        active.q1=false; 
        q1_index=cur_ques-1;
        q2_index=cur_ques;
      }
      let q1 = questions[q1_index - 1];
      let q2 = questions[q2_index - 1];  
      if(q2_index>14){
        last=true;
      }
      res.render('index', {q1, q2, active, done, last, layout:'play_layout'});
    }
  }
  else{
  res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
  }
});

router.post('/play', async function (req, res) {
  if(req.isAuthenticated()){
    let login=true;
    var ans = req.body.answer;
    var qno = req.body.qno;
    console.log(ans.toLowerCase().replace(/\s/g, ''));
    level= req.session.level;
    const prevlevel=[...level];
    let last = false;
    if (ans == answer[qno - 1] && level.includes(Number(qno)) ){
      var fun=1;
      req.session.score++;
      if(level.length == 2){
        if(qno==level[0]){
          req.session.level.shift();
          await update_score(req,req.session.email, req.session.score);
        }
        else{
          req.session.level.pop();
          await update_score(req,req.session.email, req.session.score);
        }
      }
      else if(level.length == 1){
        req.session.level=[req.session.score+1,req.session.score+2];
        await update_score(req,req.session.email, req.session.score);
      }
      res.send({fun, login});
    } else {
      var fun=0;
      if(close_ans[qno-1].includes(ans)){
        fun=2;
      }
      const q1_index=Math.min(req.session.level[0],req.session.level[1]);
      const q2_index=Math.max(req.session.level[0],req.session.level[1]);
      if(q2_index>14){
        last=true;
      }
      res.send({fun, last, login});
    }
    console.log(req.session.level);
  }
  else{
    let login=false;
    res.send({login});
  }
});

// //route to get email of users
// router.get('/126emails349', function (req, res, next) {
//   User.find()
//       .exec(function (err, result) {
//         if (err) throw err;
//         let emails=[];
//         let itr=0;
//         while (itr < result.length) {
//           emails.push(result[itr].email);
//           itr++;
//         }
//         res.send(emails);
//       });
// });

//leaderboard
router.get('/leaderboard', async function (req, res, next) {
  if(!req.isAuthenticated()){
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
  }
  const email = req.session.email;
  const user = await User.findOne({ email });
  req.session.level = user.level;
  const uname = user.username;
  const rank = await get_rank(req.session.email);
  console.log('rank is :', rank);
  console.log('THE LEADERBOARD DATA:', leaderboard_data);
  res.render('leaderboard', {
    layout: 'layout_empty',
    Rank: rank,
    User_Id: uname,
    My_score: req.session.score,
    lb_data: leaderboard_data
  });
});

module.exports = router;
