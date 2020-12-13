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

async function update_level(email, level) {
  const user = await User.findOne({ email });
  user.level = level;
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
    leaderboard_level = [];
    itr = 0;

    User.find()
      .sort({ level: -1, last_write: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        var userrank = 0;
        console.log(result[0].name, result[1].name);
        while (itr < result.length) {
          if (itr < 20) {
            leaderboard_id.push(result[itr].username);
            leaderboard_level.push(result[itr].level);
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
  res.render('', { layout: 'layout_static' });
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

router.get('/success', function (req, res, next) {
  res.render('', { func: 'register_successful()', layout: 'layout_static' });
});

router.get('/failure', function (req, res, next) {
  res.render('', { func: 'register_fail()', layout: 'layout_static', error: req.flash("error")});
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

router.get('/play', async function (req, res, next) {
  console.log('CURRENT LEVEL', req.session.level);
  let currentQuestion = questions[req.session.level - 1];
  res.render('index', currentQuestion);
  // res.render('index', {...currentQuestion,func:1});
});

router.post('/send_data', async function (req, res) {
  var ans = req.body.answer;
  let currentQuestion = questions[req.session.level - 1];
  console.log(ans, answer[req.session.level - 1]);
  if (ans == answer[req.session.level - 1]) {
    req.session.level++;
    await update_level(req.session.email, req.session.level);
    res.render('index', { ...currentQuestion, func: 1 });
    res.redirect('/play');
  } else {
    res.render('index', { ...currentQuestion, func: 0 });
  }
  console.log(req.session.level);
});

//leaderboard to be done later
router.get('/leaderboard', async function (req, res, next) {
  // req.session.level = await get_level(req.session.email);
  const email = req.session.email;
  const user = await User.findOne({ email });
  req.session.level = user.level;
  const uname = user.username;
  const rank = await get_rank(req.session.email);
  // const uname = await get_username(req.session.email);
  console.log('rank is :', rank);
  console.log('THE LEADERBOARD DATA:', leaderboard_id, leaderboard_level);
  res.render('', {
    layout: 'leaderboard',
    Rank: rank,
    User_Id: uname,
    My_Level: req.session.level,
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
    level_1: leaderboard_level[0],
    level_2: leaderboard_level[1],
    level_3: leaderboard_level[2],
    level_4: leaderboard_level[3],
    level_5: leaderboard_level[4],
    level_6: leaderboard_level[5],
    level_7: leaderboard_level[6],
    level_8: leaderboard_level[7],
    level_9: leaderboard_level[8],
    level_10: leaderboard_level[9],
    level_11: leaderboard_level[10],
    level_12: leaderboard_level[11],
    level_13: leaderboard_level[12],
    level_14: leaderboard_level[13],
    level_15: leaderboard_level[14],
    level_16: leaderboard_level[15],
    level_17: leaderboard_level[16],
    level_18: leaderboard_level[17],
    level_19: leaderboard_level[18],
    level_20: leaderboard_level[19],
  });
});

module.exports = router;
