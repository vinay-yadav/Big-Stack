const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');


// Terminal Route Monitor
const terminalRouteMonitor = (req, res, next) => {
    console.log(`request@ ${req.method} ${req.path}`);
    next();
}

// all routes
const auth = require('./routes/api/auth')
const profile = require('./routes/api/profile');
const questions = require('./routes/api/questions');

const app = express();

app.use(terminalRouteMonitor);

// Body Parse MiddleWare
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// MongoDB Configrations
const db = require('./setup/common').mongoURL;
const passport = require('passport');
// Database Connection
mongoose
    .connect(db,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      })
    .then(() => console.log('MongoDB Connected...!'))
    .catch(err => console.log('MongoDB Connection Failed: ' + err));


// Passport MiddleWare
app.use(passport.initialize());

// Config for JWT Stratgy
require('./strategies/jsonwtStrategy')(passport);


// @route  -  / GET
// @decs  -  home page
// @access  -  PUBLIC
app.get('/', (req, res) => {
    res.send('Welcome to StackOverflow');
});


// Actual Routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/questions', questions);

app.listen(process.env.PORT || 3000, () => console.log('server is running...'))