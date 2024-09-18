const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require("passport");
const passportLocal = require('./middlewares/passport-local-strategy');
const MongoStore = require('connect-mongo');
const Session_Secret = process.env.Session_Secret;

const app = express();
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));


const port =  process.env.PORT;
const expressLayouts = require('express-ejs-layouts');

// Database
const db = require('./middlewares/mongoose');//db connection

// Assets folder
// app.use(express.static('./assets'));
app.use(express.static(path.join(__dirname, './public/assets')));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//view engine

app.set('view engine','ejs'); //use express view engine
app.set('views',path.join(__dirname, 'views'));//default viws route

// storing sessions
app.use(session({
    name : 'CSV',
    secret : Session_Secret,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge : (1000 * 60 * 100)
    },
    store: new MongoStore({
        mongoUrl: db._connectionString,
        autoRemove: 'disabled'
    },(err)=>{console.log(err)}
    )
}));
//Authentication middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);


// express router////////////////////////////////////////
app.use('/',require('./routes'));//by default fetches index of routes

// starting server on port
app.listen(port,(err)=>{
    if(err){
        console.log(`Error in running server: ${err}`);
        
    }
    console.log("server is running on port "+port);
});