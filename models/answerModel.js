const mongoose = require('mongoose');
const answerSchema = new mongoose.Schema({
    qno: {
        type: Number,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    close_ans: {
        type: [String]
    }
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
