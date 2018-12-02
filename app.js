'use strict'

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// routes
const personRoutes = require('./api/routes/persons');
const userRoutes = require('./api/routes/users');

// connect to mongodb named AuthorTitleSecure
mongoose.connect('mongodb+srv://'+ process.env.DB_AUTH + '@cluster0-1mfev.mongodb.net/AuthorTitleSecure?retryWrites=true', {
    useNewUrlParser: true
});

mongoose.Promise = global.Promise;

mongoose.connection.once('open', function(){
    console.log('Connection wiht db has been made ...');
}).on('error', function(error){
    console.log('Connection error: ', error)
});

// use morgan for logging
app.use(morgan('dev'));
// app.use(morgan('combined'));

// use body-parser to parse http body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// This is just for initial test
// app.use( (req, res, next) => {
//     res.status(200).json({
//         message: 'Foo: Working'
//     });
// });

app.use('/api2/persons', personRoutes);
app.use('/api2/users', userRoutes);

//This will catch all request that have passed the middlware above
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status=404; 
    next(error);
});

// Handle all errors
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;