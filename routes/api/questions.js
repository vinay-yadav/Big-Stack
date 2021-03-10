const express = require('express');
const passport = require('passport');
const router = express.Router();


const Person = require('../../models/Person'); 
const Profile = require('../../models/Profile');
const Question = require('../../models/Question');


// @route   /api/questions
// @desc    posting question route
// @access  PUBLIC GET
router.get('/', (req, res) => {
    Question.find()
        .sort('-date')
        .then(question => res.json(question))
        .catch(err => console.log('Error in retrieving questions: ' + err));
});


// @route   /api/questions
// @desc    posting question route
// @access  PRIVATE POST
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const newQuestion = new Question({
        user: req.user.id,
        textone: req.body.textone,
        texttwo: req.body.texttwo,
        name: req.body.name
    });

    newQuestion.save()
        .then(question => res.json(question))
        .catch(err => console.log('Error in posting question: ' + err));
});


// @route   /api/questions/answer
// @desc    answer for question route
// @access  PRIVATE POST
router.post('/answer', passport.authenticate('jwt', {session: false}), (req, res) => {
    Question.findById(req.body.question)
        .then(question => {
            const newAnswer = {user: {}, text: {}, name: {}}
            newAnswer.user = req.user.id
            newAnswer.text = req.body.text
            newAnswer.name = req.body.name

            question.answers.push(newAnswer);

            question.save()
                .then(question => res.json(question))
                .catch(err => console.log('Error in saving answer: ' + err))
        })
        .catch(err => console.log('Error in finding question: ' + err));
});


// @route   /api/questions/upvote
// @desc    upvote for question route
// @access  PRIVATE POST
router.post('/upvote', passport.authenticate('jwt', {session: false}), (req, res) => {
    Question.findById(req.body.question)
        .then(question => {
            if (question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString() > 0)){
                return res.status(400).json({upvoteError: 'Already upvoted'})
            }

            question.upvotes.push({user: req.user.id});

            question.save()
                .then(question => res.json(question))
                .catch(err => console.log('Error in upvoting answer: ' + err))
        })
        .catch(err => console.log('Error in finding question: ' + err));
});

module.exports = router;