const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


const Person = require('../../models/Person'); 
const Profile = require('../../models/Profile');

// @route   /api/profile
// @desc    user profile route
// @access  PRIVATE GET
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (profile){
                res.json(profile);
            }else{
                return res.status(404).json({profileNotFound: "No Profile Found"});
            }
        })
        .catch(err => console.log(err));
});

// @route   /api/profile
// @desc    user updating or saving profile route
// @access  PRIVATE POST
router.post('/', passport.authenticate('jwt', {session:false}), (req, res) => {
    const profileValues = {}
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined){
        profileValues.languages = req.body.languages.split(',');
    }
    // Social Values
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    // Database Stuff
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (profile){
                Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileValues},
                    {new: true}
                )
                    .then(profile => res.json(profile))
                    .catch(err => console.log('err in updating profile: ' + err))
            }else{
                Profile.findOne({username: req.body.username})
                    .then(profile => {
                        if (profile){
                            res.status(400).json({usernameError: 'Username already exits'})
                        }
                        
                        new Profile(profileValues).save()
                            .then(profile => res.json(profile))
                            .catch(err => console.log('Error in saving new profile: ' + err));
                        
                    })
                    .catch(err => console.log('Error in profile save else: ' + err));
            }
        })
        .catch(err => console.log(err));
});


// @route   /api/profile/user/:username
// @desc    getting user profile based on USERNAME
// @access  PUBLIC GET
router.get('/user/:username', (req, res) => {
    // req.params is data, we get from the URL
    Profile.findOne({username: req.params.username})
        .populate('user', ['name', 'email'])
        .then(profile => {
            if (!profile) res.status(404).json({userError: 'Username does not exists'});
            res.json(profile);
        })
        .catch(err => console.log('Error in retrieving user data: ' + err));
})


// @route   /api/profile/id/:id
// @desc    getting user profile based on user_id
// @access  PUBLIC GET
router.get('/id/:id', (req, res) => {
    // req.params is data, we get from the URL
    Profile.findById(req.params.id)
        .populate('user', ['name', 'email'])
        .then(profile => {
            if (!profile) res.status(404).json({idError: 'ID does not exists'});
            res.json(profile);
        })
        .catch(err => console.log('Error in retrieving user data using ID: ' + err));
});


// @route   /api/profile/everyone
// @desc    All USERPROFILE
// @access  PUBLIC GET
router.get('/everyone', (req, res) => {
    // req.params is data, we get from the URL
    Profile.find()
        .populate('user', ['name', 'email'])
        .then(profiles => {
            if (!profiles) res.status(404).json({userError: 'NO USERs in the database'});
            res.json(profiles);
        })
        .catch(err => console.log('Error in retrieving all user data: ' + err));
})

module.exports = router;