var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const createCertificate = require('../services/certificateService');

router.get('/getcertificate', async function (req, res, next) {
    try {
        if (!req.isAuthenticated() || req.user.username == "") {
            return res.render('landing', { func: 'not_logged_in()', layout: 'layout_static' });
        }
        const email = req.session.email;
        const user = await User.findOne({ email });
        let done = (user.certificateName != "");
        let valid = (user.score > 0);
        let certificateName = user.certificateName;
        let name;
        if (user.last_name == undefined) {
            name = user.first_name;
        }
        else {
            name = user.first_name + ' ' + user.last_name;
        }
        const uname = user.username;
        if (done == true && valid == true) {
            console.log(`User ${uname} generated certificate.`)
            const pdfBytes = await createCertificate(certificateName);
            const buffer = Buffer.from(pdfBytes);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=EnigmaCertificate.pdf');
            res.setHeader('Content-Length', Buffer.byteLength(buffer));
            res.send(buffer);
        }
        else {
            res.send({ done, valid, name });
        }
    }
    catch (e) {
        next(e);
    }
});

router.post('/getcertificate', async function (req, res, next) {
    try {
        if (!req.isAuthenticated() || req.user.username == "") {
            return res.render('landing', { func: 'not_logged_in()', layout: 'layout_static' });
        }

        const uname = req.user.username;
        let valid = (req.user.score > 0);
        const { certificateName } = req.body;
        var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (format.test(certificateName) || !certificateName || valid == false) {
            return res.status(403).end();
        }
        console.log(`User ${uname} generated certificate.`)
        await User.updateOne({ "email": req.user.email }, { $set: { "certificateName": certificateName } });
        const pdfBytes = await createCertificate(certificateName);
        const buffer = Buffer.from(pdfBytes);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=EnigmaCertificate.pdf');
        res.setHeader('Content-Length', Buffer.byteLength(buffer));
        res.send(buffer);
    }
    catch (e) {
        next(e);
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

// //route to get data of users
// router.get('/126data349', function (req, res, next) {
//   User.find()
//       .sort({ score: -1, updatedAt: 1 })
//       .exec(function (err, result) {
//         if (err) throw err;
//         let users=[];
//         let itr=0;
//         while (itr < result.length) {
//           let user = [];
//           user.push(itr+1, result[itr].username, result[itr].first_name, result[itr].last_name, result[itr].email, result[itr].score);
//           itr++;
//           users.push(user);
//         }
//         var usersCsv='S.No.,Username,First Name,Last Name,Email,Score\n';
//         users.forEach(function(row) {  
//           usersCsv += row.join(',');  
//           usersCsv += "\n";  
//         });
//         res.header('Content-Type', 'text/csv');
//         res.send(usersCsv);
//       });
// });

module.exports = router;
