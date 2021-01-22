const express = require('express');
const router = express.Router();
//var bodyParser = require('body-parser');
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
// var nodemailer = require('nodemailer');
const questions = require('./questions');
const MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb";
// var url = process.env.MONGO_URI;
const crypto = require('crypto');
const store = require('store');
const User = require('../models/userModel');

var answer = [
  'enigma',
  'mikhailstolyarov',
  'marenostrumsupercomputer',
  'ramsteinairshow',
  'allmight',
  'frenchrevolution',
  'splitwise',
  'rapgod',
  'colonnade',
  'michaelcaine',
  'helloworld',
  'coronavirus',
  'robertoppenheimer',
  'dumbledoresoffice',
  'stevecarell',
  'wallaceandgromit',
  'boromir',
  'cid',
  'voldemort',
  'silencedogood',
  'boeingsca',
  'tombombadil',
  'followthedrinkinggourd',
  'michelangelomerisidacaravaggio',
  'airforcetwo',
  'rasputin',
  'wintergatan',
  'orsonscottcard',
];
// var uname;//make this particular to a session

async function update_score(req, email, score, qno) {
  const user = await User.findOne({ email });
  user.score = score;
  const nextQno=Math.max(req.session.level[0],req.session.level[1])+1;
  if(req.session.level[0]==qno){
    req.session.level[0]=nextQno;
  }
  else{
    req.session.level[1]=nextQno;
  }
  user.level=req.session.level;
  user.save();
}

// async function get_level(email) {
//   await User.findOne({ email: email }, (err, result) => {
//     if (err) throw err;
//     console.log('got the level', result.level);
//     return result.level;
//   });
// }

// function get_username(email) {
//   return new Promise(function (resolve, reject) {
//     dbo.collection('ENIGMA').findOne({ email: email }, function (err, result) {
//       if (err) throw err;
//       resolve(result.username);
//       console.log('got the username', result.username);
//     });
//     // console.log("got the level",result.level);
//   });
// }

//should we write req.session.rank,req.session.leaderboardid[]?
function get_rank(email) {
  //leaderboard and rank will be done later
  return new Promise(function (resolve, reject) {
    leaderboard_id = [];
    leaderboard_score = [];
    itr = 0;

    User.find()
      .sort({ score: -1, last_write: 1 })
      .exec(function (err, result) {
        if (err) throw err;
        var userrank = 0;
        //console.log(result[0].name, result[1].name);
        while (itr < result.length) {
          if (itr < 20) {
            leaderboard_id.push(result[itr].username);
            leaderboard_score.push(result[itr].score);
          }
          if (email == result[itr].email) {
            userrank = itr + 1;
            // req.session.uname=result[itr].username;
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

//definging the Questions
/* GET home page. */
function assign() {
  return new Promise(function (resolve, reject) {
    resolve(1);
  });
}
//why is assign required?

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

// router.post('/signin_send', async function (req, res, next) {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });

//   if (user && (await user.matchPassword(password))) {
//     console.log({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//     });

//     req.session.email = req.body.email;
//     //req.session.level = await get_level(req.body.email);
//     req.session.level = user.level;
//     //req.session.uname=req.session.username;
//     req.session.save();
//     console.log('[req.session.level]', req.session.level);
//     // db.collection('ENIGMA').doc( userid ).get()=db.collection('ENIGMA').doc( userid ).get();
//     res.redirect('/play');
//   } else {
//     res.status(401);
//     res.render('', { func: 'wrong_password()', layout: 'signin' });
//     throw new Error('Invalid email or password');
//   }
// });

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

// router.get('/success', function (req, res, next) {
//   res.render('home', { func: 'register_successful()', layout: 'layout_static' });
// });
// router.get('/loginsuccess', function (req, res, next) {
//   res.render('home', { func: 'login_successful()', layout: 'layout_static' });
// });
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
    throw new Error('Username already exists');
  }
  else{
    store.set('id',username);
    res.redirect('/auth/google');
  }

});
//only for testing, to be included in play once date is finalized
router.get('/countdown',function (req, res, next) {
  if(req.isAuthenticated()){
    res.render('', {layout:'countdown'});
  }
  else{
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }
});
//only for testing, to be included in play once date is finalized
router.get('/end',function (req, res, next) {
  if(req.isAuthenticated()){
    res.render('end', {layout:'play_layout'});
  }
  else{
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }
});


router.get('/play', async function (req, res, next) {
  if(req.isAuthenticated()){
    // to be used for countdown and finish page
    // var curDateTime = new Date();
    // var end=new Date('enddate here');
    // var start=new Date('startdate here');
    // if(curDateTime.getTime() > end.getTime()){
    //   res.render('end', {layout:'play_layout'});
    // }
    // else if(curDateTime.getTime() < start.getTime()){
    //   res.render('', {layout:'countdown'});
    // }
    console.log('CURRENT LEVEL', req.session.level);
    const q1_index=Math.min(req.session.level[0],req.session.level[1]);
    const q2_index=Math.max(req.session.level[0],req.session.level[1]);
    let q1 = questions[q1_index - 1];
    let q2 = questions[q2_index - 1];
    res.render('index', {q1,q2,active:{q1: true} , layout:'play_layout'});
  // res.render('index', {...currentQuestion,func:1});
  }
  else{
  res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
  }
});

router.post('/play', async function (req, res) {
  if(req.isAuthenticated()){
    var ans = req.body.answer;
    var qno = req.body.qno;
    console.log(ans.toLowerCase().replace(/\s/g, ''));
    //console.log(ans, answer[qno - 1]);
    level= req.session.level;
    if (ans == answer[qno - 1] && (qno==level[0] || qno==level[1]) ){
      req.session.score++;
      await update_score(req,req.session.email, req.session.score,qno);
      const q1_index=Math.min(req.session.level[0],req.session.level[1]);
      const q2_index=Math.max(req.session.level[0],req.session.level[1]);
      let q1 = questions[q1_index - 1];
      let q2 = questions[q2_index - 1];
      res.render('index', { q1,q2, layout:'play_layout',active:{q1: true} , func: 1 });
    } else {
      const close_ans=['iiti','enigmaiiti','tqc']; // to be done through db
      var fun=0;
      if(close_ans.includes(ans)){
        fun=2;
      }
      const q1_index=Math.min(req.session.level[0],req.session.level[1]);
      const q2_index=Math.max(req.session.level[0],req.session.level[1]);
      let q1 = questions[q1_index - 1];
      var active={q1: true};
      let q2 = questions[q2_index - 1];
      if(qno!=q1.q_no){
        if(qno == q2.q_no){
          active.q1=false;
        }
        else{
          active.q1=true;
        }
      }
      res.render('index', { q1,q2, layout:'play_layout',active , func: fun });
    }
    console.log(req.session.level);
  }
  else{
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }

});

//leaderboard to be done later
router.get('/leaderboard', async function (req, res, next) {
  // req.session.level = await get_level(req.session.email);
  if(!req.isAuthenticated()){
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
  }
  const email = req.session.email;
  const user = await User.findOne({ email });
  req.session.level = user.level;
  const uname = user.username;
  const rank = await get_rank(req.session.email);
  // const uname = await get_username(req.session.email);
  console.log('rank is :', rank);
  console.log('THE LEADERBOARD DATA:', leaderboard_id, leaderboard_score);
  res.render('leaderboard', {
    layout: 'layout_empty',
    Rank: rank,
    User_Id: uname,
    My_score: req.session.score,
    userid_1: leaderboard_id[0],
    userid_2: leaderboard_id[1],
    userid_3: leaderboard_id[2],
    userid_4: leaderboard_id[3],
    userid_5: leaderboard_id[4],
    userid_6: leaderboard_id[5],
    userid_7: leaderboard_id[6],
    userid_8: leaderboard_id[7],
    userid_9: leaderboard_id[8],
    userid_10: leaderboard_id[9],
    userid_11: leaderboard_id[10],
    userid_12: leaderboard_id[11],
    userid_13: leaderboard_id[12],
    userid_14: leaderboard_id[13],
    userid_15: leaderboard_id[14],
    userid_16: leaderboard_id[15],
    userid_17: leaderboard_id[16],
    userid_18: leaderboard_id[17],
    userid_19: leaderboard_id[18],
    userid_20: leaderboard_id[19],
    score_1: leaderboard_score[0],
    score_2: leaderboard_score[1],
    score_3: leaderboard_score[2],
    score_4: leaderboard_score[3],
    score_5: leaderboard_score[4],
    score_6: leaderboard_score[5],
    score_7: leaderboard_score[6],
    score_8: leaderboard_score[7],
    score_9: leaderboard_score[8],
    score_10: leaderboard_score[9],
    score_11: leaderboard_score[10],
    score_12: leaderboard_score[11],
    score_13: leaderboard_score[12],
    score_14: leaderboard_score[13],
    score_15: leaderboard_score[14],
    score_16: leaderboard_score[15],
    score_17: leaderboard_score[16],
    score_18: leaderboard_score[17],
    score_19: leaderboard_score[18],
    score_20: leaderboard_score[19],
  });
});

module.exports = router;
