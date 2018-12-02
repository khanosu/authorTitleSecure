//@ts-check
'use strict'

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const verify = require('../middleware/verify');

// requests that reach this part have already gone through the /users filter

router.get('/', verify, (req, res, next) => {
    // This is for initial testing
    // res.status(200).json({
    //     verb: 'GET',
    //     message: 'handling GET requests to /api/products'
    // });

    User
        // .find({name: /gold/i})  // using reg expression /gold/i in query
        .find()
        // .limit(5)
        // .select('-__v')
        // .select('_id name price')
        .exec()
        .then(users => {
            // console.log(docs);
            const response = {
                users: users.map(user => {
                    return {
                        _id: user._id,
                        email: user.email,
                    };
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/signup', (req, res, next) => {
    if (process.env.SIGNUP === 'TRUE') {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err
                });
            } else {
                const user = new User({
                    _id: mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash
                });

                user.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'user with email: ' + user.email + ' created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        });
    } else {
        res.status(200).json({
            message: 'Signup has been disabled!'
        });
    }
})

router.post('/login', (req, res, next) => {
    User.findOne({
            email: req.body.email
        })
        .exec()
        .then(user => {

            if (!user) {
                return res.status(401).json({
                    message: 'Authentication Faield'
                });
            }

            // we will reach here only if the user is not equal to null 

            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authentication Faield'
                    });
                }

                if (result) {
                    // We want to create a JWT Token here and send it to the user
                    // Here we are using the Synchronous mode of jwt.sign without a callback
                   const token =  jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );

                    return res.status(200).json({
                        message: 'Authentication Successful',
                        token: token
                    });
                }

                res.status(401).json({
                    message: 'Authentication Faield'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

module.exports = router;