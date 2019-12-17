const request = require('supertest');
const mongoose = require('mongoose');

const app  = require('../../../server');

require('../../../models/accounts');
require('../../../models/profiles');
require('../../../models/list');
require('../../../models/listItem');

var Account      = mongoose.model('Account');
var Profile      = mongoose.model('Profile');
var List         = mongoose.model('List');
var ListItem     = mongoose.model('ListItem');



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

var generateCreateListRequest = function (aid, category, name, type, vsbl) {
    var obj = {aid, category, name, type, vsbl}

    return request(app).post('/lists/cr_list').send(obj);
}

var generateCreateSingleListItemRequest = function (aid, lsid, list_name) {
    var obj = {aid, lsid, list_name}

    return request(app).post('/lists/cr_list_item').send(obj);
}

var generateCreateMultiListItemRequest = function (lsid, list_name_arr) {
    var obj = {lsid, list_name_arr}

    return request(app).post('/lists/cr_list_item_mult').send(obj);
}

var generateInitListItemRequest = function (lsid) {
    var obj = {lsid}

    return request(app).post('/lists/init_list').send(obj);
}

var generateFetchListRequest = function () {

    return request(app).post('/lists/fetch_list');
}

var generateEditListItem = function (aid, lsid, lsitid, list_name) {
    var obj = {aid, lsid, lsitid, list_name}

    return request(app).post('/lists/ed_list_item')
}

var generateDeleteListItemRequest = function(aid, lsid, lsitid) {
    obj = {aid, lsid, lsitid}

    return request(app).post('/lists/del_list_item').send(obj)
}

var generateDeleteListRequest = function(aid, lsid) {
    obj = {aid, lsid}

    return request(app).post('/lists/del_list').send(obj)
}

var generateFetchListRequest_v2 = function () {
    return request(app).get('/lists/fetch_list_v2');
}

var generateCreateListRequest_v3 = function (aid, category, name, live, public, close, conscious) {
    var obj = {aid, category, name, live, public, close, conscious};

    return request(app).post('/lists/cr_list_v3').send(obj);
}

module.exports = {
    generateSignupRequest,
    generateVerifyRequest,
    generateCreateAndVerifyRequest,
    generateCreateListRequest,
    generateLoginRequest,
    generateCreateSingleListItemRequest,
    generateCreateMultiListItemRequest,
    generateInitListItemRequest,
    generateFetchListRequest,
    generateEditListItem,
    generateDeleteListItemRequest,
    generateDeleteListRequest,
    generateFetchListRequest_v2,
    generateCreateListRequest_v3
}