const express = require('express');
const articlesModel = require('../models/articles');
var home = express.Router();


//
// Home route
//
home.get('/', (req, res) => {
    articlesModel.find({}, (err, articles) => {
        if (err) {
            req.flash('danger', 'Failed to find the Articles');
            console.log(err);
        } else {
            res.render('index', {title: 'Articles', articles: articles});
        }
    });
});


module.exports = home