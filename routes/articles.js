const express = require('express');
const articlesModel = require('../models/articles');
const userModel = require('../models/user');
var articles = express.Router();


//
// Articles Add routes
//
articles.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {title: 'Add Article'});
});

articles.post('/add', (req, res) => {
    // Form validation using expess-validator
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Validation Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new articlesModel();
        
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(err => {
            if (err) {
                req.flash('danger', 'Failed Submission Failed');
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});


//
// Articles Edit ID routes
//
articles.get('/edit/:id', ensureAuthenticated, (req, res) => {
    articlesModel.findById(req.params.id, (err, article) => {
        // Ensure user owns the current article
        console.log(article.author + " == " + req.user._id);
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorised!');
            res.redirect('/');
        } else {
            if (err) {
                req.flash('danger', 'Failed to find the Article');
                console.log(err);
            } else {
                res.render('edit_article', {title: 'Edit Article', article: article});
            }
        }
    });
});

articles.post('/edit/:id', (req, res) => {
    // Form validation using expess-validator
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Validation Errors
    let errors = req.validationErrors();

    if (errors) {
        articlesModel.findById(req.params.id, (err, article) => {
            if (err) {
                req.flash('danger', 'Failed to find the Article');
                console.log(err);
            } else {
                res.render('edit_article', {
                    title: 'Edit Article',
                    article: article,
                    errors: errors
                });
            }
        });
    } else {
        let article = {};

        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        let query = {_id: req.params.id};

        articlesModel.updateOne(query, article, err => {
            if (err) {
                req.flash('danger', 'Article Update Failed');
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Updated');
                res.redirect('/');
            }
        });
    }
});


//
// My Articles
//
articles.get('/myarticles', ensureAuthenticated, (req, res) => {
    let query = {author: req.user._id};

    articlesModel.find(query, (err, articles) => {
        if (err) {
            req.flash('danger', 'Failed to find the Articles');
            console.log(err);
        } else {
            res.render('index', {title: 'Articles', articles: articles});
        }
    });
});


//
// Articles ID route
//
articles.get('/:id', (req, res) => {
    articlesModel.findById(req.params.id, (err, article) => {
        if (err) {
            req.flash('danger', 'Failed to find the Article');
            console.log(err);
        } else {
            userModel.findById(article.author, (err, user) => {
                res.render('article', {
                    article: article,
                    author: user.name
                });
            });
        }
    });
});

articles.delete('/:id', ensureAuthenticated, (req, res) => {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    articlesModel.findById(query, (err, article) => {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            articlesModel.deleteOne(query, err => {
                if (err) {
                    req.flash('danger', 'Failed to delete the Article');
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Article Deleted');
                    res.send('Succesful deletion');
                }
            });
        }
    });
 });


//
// Access Control
//
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}


module.exports = articles