var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressValidator= require('express-validator');


require('./db/connect');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accounts    = require('./routes/accounts');
var adminPanels = require('./routes/adminPanels');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(expressValidator({
    customValidators:{
      isValidEmail:function(value){
        if(!value) return false;
        var val = value.trim();
        var email_reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return email_reg_exp.test(val);
      },
      isValidMongoId:function(value){
        if(!value) return false;
        var regex = /^[0-9a-f]{24}$/;
        return regex.test(value);
      }
    }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/accounts',accounts);
app.use('/adminPanels',adminPanels);

module.exports = app;
