const mongoose = require('mongoose');
const qnaSchema = new mongoose.Schema({
    q_no: {
        type: Number,
        required: true,
    },
    q_des: {
        type: String
    },
    link: {
        type: String
    },
    comment: {
        typ: String
    },
    res1_width: {
        type: String
    },
    res1_height: {
        type: String
    },
    res1_link: {
        type: String
    },
    res1_type: {
        type: String
    },
    res2_present: {
        type: Boolean
    },
    res2_link: {
        type: String
    },
    res2_type: {
        type: String
    },
    res2_width: {
        type: String
    },
    res2_height: {
        type: String
    },
    answer: {
        type: String,
        required: true,
    },
    close_ans: {
        type: [String]
    }
});

const QnA = mongoose.model('qna', qnaSchema);
module.exports = QnA;
