var express = require('express');
var router = express.Router();
const User = require('../models/userModel');

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
