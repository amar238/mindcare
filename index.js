const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();



const port = 8000;
const expressLayouts = require('express-ejs-layouts');

// Assets folder
// app.use(express.static('./assets'));
app.use(express.static(path.join(__dirname, './public/assets')));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//view engine

app.set('view engine','ejs'); //use express view engine
app.set('views',path.join(__dirname, 'views'));//default viws route


// express router////////////////////////////////////////
app.use('/',require('./routes'));//by default fetches index of routes

// starting server on port
app.listen(port,(err)=>{
    if(err){
        console.log(`Error in running server: ${err}`);
        
    }
    console.log("server is running on port "+port);
});