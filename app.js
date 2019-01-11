//
// Imports
//
const express = require('express');
const session = require('express-session');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

const appConfig = require('./config/app');
const dbConfig = require('./config/database');
require('./config/passport')(passport); // Slightly different wa of setting up the passport configuration (Module.exports is exporting a function, rather than an object)

const home = require('./routes/home');
const articles = require('./routes/articles');
const users = require('./routes/users');



//
// Init app
//
const app = express();


//
// MongoDB / Mongoose connection
//
mongoose.connect(dbConfig.service + '://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.name, {useNewUrlParser: true});
const db = mongoose.connection;

// Confirm DB connection
db.once('open', () => {
    console.log('Connected to ' + dbConfig.service.toUpperCase() + ': ' + dbConfig.name + ' on ' + dbConfig.host + ':' + dbConfig.port);
});

// Report DB errors
db.on('error', err => {
    console.log(err);
});


//
// Load View Engine
//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//
// Body Parser Middleware
//

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Parse application/json
app.use(bodyParser.json());


//
// Set Public Folder
//
app.use(express.static(path.join(__dirname, 'public')));


//
// Express Session Middleware
//
app.use(session({
    secret: dbConfig.secret,
    resave: false,
    saveUninitialized: true
}));


//
// Express Messages Middleware
//
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


//
// Express Validator Middleware
//
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.');
        var root = namespace.shift();
        var formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


//
// Passport Middleware
//
app.use(passport.initialize());
app.use(passport.session());


//
// Routing
//

app.get('*', (req, res, next) => {
    // if there is a req.user object (Passport creates this object upon successful login) then store this user in the res.locals.user variable
    // Do this for all routes and then call the next route handler
    // We can refer to res.locals.user as "user" in layout.pug
    res.locals.user = req.user || null;
    next();
});

// Home routing
app.use('/', home);

// Articles routing
app.use('/articles', articles);

// User routing
app.use('/users', users);


//
// Start Server
//
app.listen(appConfig.port, () => {
    console.log('Server started on port: ' + appConfig.port + '...');
});