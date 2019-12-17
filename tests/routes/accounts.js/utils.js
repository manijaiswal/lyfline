const request = require('supertest');
const mongoose = require('mongoose');

const app  = require('../../../server');

require('../../../models/accounts');
require('../../../models/emailCodes');

var Account = mongoose.model('Account');
var EmailOtp = mongoose.model('EmailOtp');


var generateSignupRequest  =  function(user_name,email,password){
    var obj = {user_name,email,password}

    return request(app).post('/accounts/cr_acc').send(obj);
}

var generateVerifyRequest = function(aid,code){
    var obj = {aid,code};

    return request(app).post('/accounts/verify_email').send(obj);

}


var generateCreateAndVerifyRequest = function(user_name,email,password,cb){
   generateSignupRequest(user_name,email,password)
   .end(function(err,res){
       if(err){
          return cb(err,false);
       }
       var aid = res.body['data']['_id'];
       var  status = EmailOtp.STATUS.NOT_USED;
       EmailOtp.find({aid,status},function(err,otpData){
           if(err){
               return cb(err,false);
           }

           var code = otpData[0]['code'];

           generateVerifyRequest(aid,code)
           .end(function(err,res2){
               if(err){
                   return cb(err,false);
               }
               return cb(false,res2)
           })
       })
   })

}

var generateLoginRequest = function (email, password) {
    var obj = {email, password}

    return request(app).post('/accounts/login').send(obj)
}

module.exports = {
    generateSignupRequest    :  generateSignupRequest,
    generateVerifyRequest    :  generateVerifyRequest,
    generateCreateAndVerifyRequest : generateCreateAndVerifyRequest,
    generateLoginRequest: generateLoginRequest
}