const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const User = require('../models/userModel');
const QnA = require('../models/qnaModel');


async function update_score(req, email, score) {
  const user = await User.findOne({ email });
  user.score = score;
  user.level = req.session.level;
  await user.save();
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


router.get('/play', async function (req, res, next) {
  try{
    if(req.isAuthenticated() && req.user.username != "" ){
      //to be used for countdown and finish page
      var curDateTime = new Date();
      var end=new Date("2021-04-25T23:59:59+05:30");
      var start=new Date('2021-04-23T00:34:59+05:30');
      //console.log(curDateTime.getTime() < start.getTime());
      if(curDateTime.getTime() > end.getTime()){
        return res.render('end', {layout:'play_layout'});
      }
      else if(curDateTime.getTime() < start.getTime()){
        return res.render('', {layout:'countdown'});
      }
      const noOfQuestions = await QnA.countDocuments({});
      console.log('CURRENT LEVEL', req.session.level);
      // for completion
      if(Math.min(...req.session.level)>noOfQuestions){
        return res.render('complete', {text:"Congrats! You completed Enigma.",layout:'play_layout'});
      }
      let last = false;
      if(req.session.level.length == 2){
        const q1_index=req.session.level[0];
        const q2_index=req.session.level[1];
        let q1 = await QnA.findOne({ q_no : q1_index }).lean();
        let q2 = await QnA.findOne({ q_no : q2_index }).lean();
        if(q2_index>noOfQuestions){
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
        let q1 = await QnA.findOne({ q_no : q1_index }).lean();
        let q2 = await QnA.findOne({ q_no : q2_index }).lean(); 
        if(q2_index>noOfQuestions){
          last=true;
        }
        res.render('index', {q1, q2, active, done, last, layout:'play_layout'});
      }
    }
    else{
    res.render('landing', { func: 'not_logged_in()', layout: 'layout_static'});
    }
}
catch(e){
  next(e);
}
});

router.post('/play', async function (req, res, next) {
try{
  if(req.isAuthenticated() && req.user.username != ""){
    var curDateTime = new Date();
    var end=new Date("2022-04-25T23:59:59+05:30");
    var start=new Date('2021-04-23T00:34:59+05:30');
    //console.log(curDateTime.getTime() < start.getTime());
    if(curDateTime.getTime() > end.getTime()){
      return res.render('end', {layout:'play_layout'});
    }
    else if(curDateTime.getTime() < start.getTime()){
      return res.render('', {layout:'countdown'});
    }
    let login=true;
    var ans = req.body.answer;
    var qno = req.body.qno;
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(format.test(ans) || format.test(qno)){
      var fun=0;
      res.send({fun, login});
      return;
    }
    console.log(ans.toLowerCase().replace(/\s/g, ''));
    level= req.session.level;
    const prevlevel=[...level];
    const noOfQuestions = await QnA.countDocuments({});
    let last = false;
    let ques = await QnA.findOne({ q_no : qno });
    if (ans == ques.answer && level.includes(Number(qno)) ){
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
      let ques = await QnA.findOne({ q_no : qno });
      if(ques.close_ans.includes(ans)){
        fun=2;
      }
      const q1_index=Math.min(req.session.level[0],req.session.level[1]);
      const q2_index=Math.max(req.session.level[0],req.session.level[1]);
      if(q2_index>noOfQuestions){
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
}
catch(e){
  next(e);
}
});

// // route to load questions in database
// // requires questions.js file,answer[],close_ans[]
// router.get('/loadquestions', async function (req, res, next) {
//   const noOfQuestions = await QnA.countDocuments({});
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
