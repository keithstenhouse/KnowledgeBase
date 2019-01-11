const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const userModel = require('../models/user');
var user = express.Router();


//
// Register Form
//
user.get('/register', (req, res) => {
    res.render('register');
});

// Register Process
user.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(password);

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new userModel({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                    console.log(err);
                    req.flash('danger', 'Something went wrong when trying to encrypt your password, please try again');
                    res.redirect('/users/register');
                }
                newUser.password = hash;
                newUser.save(err => {
                    if (err) {
                        req.flash('danger', 'The username "' + username + '" is already taken, please try another');
                        res.redirect('/users/register');
                    } else {
                        req.flash('success', 'You are now registered and can log in');
                        res.redirect('/users/login');
                    }
                })
            });
        });
    }
});


//
// Login Form
//
user.get('/login', (req, res) => {
    res.render('login');
});

// Login Process
user.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


//
// Logout
//
user.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
})



module.exports = user