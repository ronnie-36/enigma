const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const QnA = require('../models/qnaModel');

router.get('/', async function (req, res, next) {
    try {
        if (req.isAuthenticated() && req.user.username != "") {
            //to be used for countdown and finish page
            const curDateTime = new Date();
            const end = new Date("2021-04-25T23:59:59+05:30");
            const start = new Date('2021-04-23T00:34:59+05:30');
            //console.log(curDateTime.getTime() < start.getTime());
            if (curDateTime.getTime() > end.getTime()) {
                return res.render('end', { layout: 'play_layout' });
            }
            else if (curDateTime.getTime() < start.getTime()) {
                return res.render('', { layout: 'countdown' });
            }
            const noOfQuestions = await QnA.countDocuments({});
            console.log('CURRENT LEVEL', req.session.level);
            // for completion
            if (Math.min(...req.session.level) > noOfQuestions) {
                return res.render('complete', { text: "Congrats! You completed Enigma.", layout: 'play_layout' });
            }
            let last = false;
            if (req.session.level.length == 2) {
                const q1_index = req.session.level[0];
                const q2_index = req.session.level[1];
                const q1 = await QnA.findOne({ q_no: q1_index }).lean();
                const q2 = await QnA.findOne({ q_no: q2_index }).lean();
                if (q2_index > noOfQuestions) {
                    last = true;
                }
                var done = { q1: false, q2: false };
                res.render('index', { q1, q2, active: { q1: true }, last, done, layout: 'play_layout' });
            }
            else if (req.session.level.length == 1) {
                const cur_ques = req.session.level[0];
                let done = { q1: false, q2: false };
                let active = { q1: true };
                let q1_index;
                let q2_index;
                if (cur_ques & 1) {
                    done.q2 = true;
                    active.q1 = true;
                    q1_index = cur_ques;
                    q2_index = cur_ques + 1;
                }
                else {
                    done.q1 = true;
                    active.q1 = false;
                    q1_index = cur_ques - 1;
                    q2_index = cur_ques;
                }
                const q1 = await QnA.findOne({ q_no: q1_index }).lean();
                const q2 = await QnA.findOne({ q_no: q2_index }).lean();
                if (q2_index > noOfQuestions) {
                    last = true;
                }
                res.render('index', { q1, q2, active, done, last, layout: 'play_layout' });
            }
        }
        else {
            res.render('landing', { func: 'not_logged_in()', layout: 'layout_static' });
        }
    }
    catch (e) {
        next(e);
    }
});

router.post('/', async function (req, res, next) {
    try {
        if (req.isAuthenticated() && req.user.username != "") {
            const curDateTime = new Date();
            const end = new Date("2021-04-25T23:59:59+05:30");
            const start = new Date('2021-04-23T00:34:59+05:30');
            //console.log(curDateTime.getTime() < start.getTime());
            if (curDateTime.getTime() > end.getTime()) {
                return res.render('end', { layout: 'play_layout' });
            }
            else if (curDateTime.getTime() < start.getTime()) {
                return res.render('', { layout: 'countdown' });
            }
            let login = true;
            const userAns = req.body.answer;
            const qno = req.body.qno;
            var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            if (format.test(userAns) || format.test(qno)) {
                let fun = 0;
                res.send({ fun, login });
                return;
            }
            console.log(userAns.toLowerCase().replace(/\s/g, ''));
            let level = [...req.session.level];
            // const prevlevel = [...level];
            const ques = await QnA.findOne({ q_no: qno });
            if (userAns == ques.answer && level.includes(Number(qno))) {
                let fun = 1;
                req.session.score++;
                if (level.length == 2) {
                    if (qno == level[0]) {
                        req.session.level.shift();
                        await User.updateOne({ "email": req.session.email }, { $set: { "level": req.session.level, "score": req.session.score, "last_write": new Date() } });
                    }
                    else {
                        req.session.level.pop();
                        await User.updateOne({ "email": req.session.email }, { $set: { "level": req.session.level, "score": req.session.score, "last_write": new Date() } });
                    }
                }
                else if (level.length == 1) {
                    let temp = level[0];
                    if (temp & 1) {
                        temp++;
                    }
                    req.session.level = [temp + 1, temp + 2];
                    await User.updateOne({ "email": req.session.email }, { $set: { "level": req.session.level, "score": req.session.score, "last_write": new Date() } });
                }
                res.send({ fun, login });
            }
            else {
                let fun = 0;
                const ques = await QnA.findOne({ q_no: qno });
                if (ques.close_ans.includes(userAns)) {
                    fun = 2;
                }
                res.send({ fun, login });
            }
            console.log(req.session.level);
        }
        else {
            let login = false;
            res.send({ login });
        }
    }
    catch (e) {
        next(e);
    }
});

router.get('/practice', async function (req, res, next) {
    try {
        if (req.isAuthenticated() && req.user.username != "") {
            //to be used for countdown and finish page
            const curDateTime = new Date();
            const end = new Date("2021-04-25T23:59:59+05:30");
            const start = new Date('2021-04-23T00:34:59+05:30');
            //console.log(curDateTime.getTime() < start.getTime());
            if (curDateTime.getTime() < start.getTime()) {
                return res.render('', { layout: 'countdown' });
            }
            else if (curDateTime.getTime() > end.getTime()) {
                const noOfQuestions = await QnA.countDocuments({});
                console.log('CURRENT LEVEL', req.session.level);
                // for completion
                if (Math.min(...req.session.level) > noOfQuestions) {
                    return res.render('end', { func: 'practice_completed()', layout: 'practice_layout' });
                }
                let last = false;
                if (req.session.level.length == 2) {
                    const q1_index = req.session.level[0];
                    const q2_index = req.session.level[1];
                    const q1 = await QnA.findOne({ q_no: q1_index }).lean();
                    const q2 = await QnA.findOne({ q_no: q2_index }).lean();
                    if (q2_index > noOfQuestions) {
                        last = true;
                    }
                    var done = { q1: false, q2: false };
                    res.render('index', { q1, q2, active: { q1: true }, last, done, layout: 'practice_layout' });
                }
                else if (req.session.level.length == 1) {
                    const cur_ques = req.session.level[0];
                    let done = { q1: false, q2: false };
                    let active = { q1: true };
                    let q1_index;
                    let q2_index;
                    if (cur_ques & 1) {
                        done.q2 = true;
                        active.q1 = true;
                        q1_index = cur_ques;
                        q2_index = cur_ques + 1;
                    }
                    else {
                        done.q1 = true;
                        active.q1 = false;
                        q1_index = cur_ques - 1;
                        q2_index = cur_ques;
                    }
                    const q1 = await QnA.findOne({ q_no: q1_index }).lean();
                    const q2 = await QnA.findOne({ q_no: q2_index }).lean();
                    if (q2_index > noOfQuestions) {
                        last = true;
                    }
                    res.render('index', { q1, q2, active, done, last, layout: 'practice_layout' });
                }
            }
            else {
                res.redirect('/play');
            }
        }
        else {
            res.render('landing', { func: 'not_logged_in()', layout: 'layout_static' });
        }
    }
    catch (e) {
        next(e);
    }
});

router.post('/practice', async function (req, res, next) {
    try {
        if (req.isAuthenticated() && req.user.username != "") {
            const curDateTime = new Date();
            const end = new Date("2021-04-25T23:59:59+05:30");
            const start = new Date('2021-04-23T00:34:59+05:30');

            if (curDateTime.getTime() < start.getTime()) {
                return res.render('', { layout: 'countdown' });
            }
            else if (curDateTime.getTime() > end.getTime()) {
                let login = true;
                const userAns = req.body.answer;
                const qno = req.body.qno;
                var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
                if (format.test(userAns) || format.test(qno)) {
                    let fun = 0;
                    res.send({ fun, login });
                    return;
                }
                console.log(userAns.toLowerCase().replace(/\s/g, ''));
                let level = [...req.session.level];
                // const prevlevel = [...level];
                const ques = await QnA.findOne({ q_no: qno });
                if (userAns == ques.answer && level.includes(Number(qno))) {
                    let fun = 1;
                    // req.session.score++;
                    if (level.length == 2) {
                        if (qno == level[0]) {
                            req.session.level.shift();
                            await User.updateOne({ "email": req.session.email }, { $set: { "level": req.session.level } });
                        }
                        else {
                            req.session.level.pop();
                            await User.updateOne({ "email": req.session.email }, { $set: { "level": req.session.level } });
                        }
                    }
                    else if (level.length == 1) {
                        let temp = level[0];
                        if (temp & 1) {
                            temp++;
                        }
                        req.session.level = [temp + 1, temp + 2];
                        await User.updateOne({ "email": req.session.email }, { $set: { "level": req.session.level } });
                    }
                    res.send({ fun, login });
                }
                else {
                    let fun = 0;
                    const ques = await QnA.findOne({ q_no: qno });
                    if (ques.close_ans.includes(userAns)) {
                        fun = 2;
                    }
                    res.send({ fun, login });
                }
                console.log(req.session.level);
            }
            else {
                res.redirect('/play');
            }
        }
        else {
            let login = false;
            res.send({ login });
        }
    }
    catch (e) {
        next(e);
    }
});

module.exports = router;