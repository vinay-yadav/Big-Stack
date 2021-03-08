const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');

const key = require('../../setup/common');

// @route   /api/auth
// @desc    api auth route
// @access  PUBLIC GET
router.get('/', (req, res) => res.json({test: 'Auth is success!'}))


// Importing Person Schema
const Person = require('../../models/Person');

// @route   /api/auth/register
// @desc    api resgistration route
// @access  PUBLIC POST
router.post('/register', (req, res) => {
    // just like objects.get
    Person.findOne({email: req.body.email})
        .then(person => {
            if (person) {
                return res.status(400).json({emailError: 'Email alresy exists!'})
            }else {
                const newPerson = new Person({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                // Encrypting Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPerson.password, salt, (err, hash) => {
                        if (err) throw err;
                        newPerson.password = hash;
                        newPerson.save()
                            .then(person => res.json(person))
                            .catch(err => console.log(err))
                    });
                });
            }
        })
        .catch(err => console.log(`@${req.path}: ${err}`))
})


// @route   /api/auth/login
// @desc    user login route
// @access  PUBLIC POST
router.post('/login', (req, res) => {
    Person.findOne({email: req.body.email})
        .then(person => {
            if (person){
                // Comparing Password
                bcrypt.compare(req.body.password, person.password)
                    .then(isCorrect => {
                        if (isCorrect){
                            // res.status(201).json({success: 'Login Successfull!!!'})
                            // creating payload for user
                            const payload = {
                                id: person.id,
                                name: person.name,
                                email: person.email
                            };
                            jsonwt.sign(
                                payload,
                                key.secret,
                                {expiresIn: 3600},
                                (err, token) => {
                                    if (err) throw err;
                                    res.json({
                                        success: true,
                                        token: "Bearer " + token
                                    })
                                }
                            )

                        }else{
                            res.status(400).json({passwordError: 'Incorrect Password'})
                        }

                    })
                    .catch(err => console.log(err))
            }else {
                return res.status(404).json({userError: 'Email does not exist!'})
            }
        })
        .catch(err => console.log(err))
})

// @route   /api/auth/profile
// @desc    user profile route
// @access  PRIVATE GET
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json(req.user);
})


module.exports = router;