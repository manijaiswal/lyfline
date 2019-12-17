const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');

const app = require('../../../server');
const config = require('../../configs');
const utils = require('./utils');
const errors = require('../../../utility/errors');
require('../../../models/accounts');
require('../../../models/emailCodes');

var Account = mongoose.model('Account');
var EmailOtp = mongoose.model('EmailOtp');



describe('Create New account and verify', () => {

  before(function (done) {
    this.timeout(config.DEFAULT_TIMEOUT);
    mongoose.connect('mongodb://localhost/listieeTest', () => {
      mongoose.connection.db.dropDatabase(function (err, resp) {
        if (err) {
          console.log(err);
          return done();
        };
  
        setTimeout(function () {
        //   console.log("Database has been reset!");
          return done();
        }, 5000);
    })
    });
  });

  var REQUEST_OTP_RESP
  describe('POST /accounts/cr_acc', () => {
    it('should return 200 for web signup', (done) => {
      // console.log("chala")
      utils.generateSignupRequest("Manish", "mk6598951@gmail.com", "Nitp@123")
        .expect(200)
        .end(function (err, res) {
          if (err) {return done(err);}

          REQUEST_OTP_RESP = res.body['data'];

          done();
        })
    }).timeout(config.DEFAULT_TIMEOUT);

    it('should return 400 if password length is less than 8', (done) => {
        utils.generateSignupRequest("manish","mk6598951@gmail.com","Nitp@12")
        .expect(400)
        .end(function(err,res){
          if(err){
            return done(err);
          }
          done();
        })
    }).timeout(config.DEFAULT_TIMEOUT);


    it('should return 400 if password doesnot Contain captial and special charactor', (done) => {
      utils.generateSignupRequest("manish","mk6598951@gmail.com","nitp1218788")
      .expect(400)
      .end(function(err,res){
        if(err){
          return done(err);
        }
        done();
      })
    }).timeout(config.DEFAULT_TIMEOUT);
    
    it('should return 400 when Invalid Account Id is verified',(done)=>{
      var aid = "5c63147fca2cd924198be3dc";
      utils.generateVerifyRequest(aid,"555552")
      .expect(400)
      .end(function(err,resp1){
        if(err){
          return done(err);
        }
        done();
      })
    }).timeout(config.DEFAULT_TIMEOUT);

    it('should return 400 when Invalid Otp is given',(done)=>{
      var aid = REQUEST_OTP_RESP['_id'];
      utils.generateVerifyRequest(aid,"555552")
      .expect(400)
      .end(function(err,resp){
        if(err){
         return done(err);
        }
        expect(resp.body.code).to.equal(errors["otp_invalid"][0]);
        expect(resp.body.message).to.equal(errors["otp_invalid"][1]);
        expect(resp.body.success).to.equal(false);
        done();
      })
    }).timeout(config.DEFAULT_TIMEOUT);

    it('should return 200 after successful account creation',(done)=>{
      var aid = REQUEST_OTP_RESP['_id'];
      EmailOtp.findOne({aid,status:1},function(err,otpData){
        if(err){
          return done(err);
        }
        var code = otpData['code'];

        utils.generateVerifyRequest(aid,code)
        .expect(200)
        .end(function(err,resp1){
          if(err){
            return done(err);
          }
          console.log(resp1.body);
          done();
        })

      })
    }).timeout(config.DEFAULT_TIMEOUT);

  })
});


describe('user login to account', () => {

  describe('POST /accounts/login', () => {

    it('should return 400 if email field is empty', (done) => {
      utils.generateLoginRequest("", "Nitp@123")
      .set('x-access-token', '5')
      .expect(400)
      .end( (err, res) => {
        if(err) {
          return done(err)
        }
        done();
      })
    })
    
    it('should return 400 if password field is empty', (done) => {
      utils.generateLoginRequest("mk6598951@gmail.com", "")
      .set('x-access-token', '5')
      .expect(400)
      .end( (err, res) => {
        if(err) {
          return done(err)
        }
        done();
      })
    }) 

    it('should return 200 for corrct credetials', (done) => {
      utils.generateLoginRequest("mk6598951@gmail.com", "Nitp@123")
        .set('x-access-token', '5')
        .expect(200)
        .end( (err, res) => {
          if(err) {
            return done(err)
          }
          
          done();
        })
    })

    it('should return 400 if profile does not exist', (done) => {
      utils.generateLoginRequest("mk6598c951@gmail.com", "Nitp@123")
        .set('x-access-token', '5')
        .expect(400)
        .end( (err, res) => {
          if(err) {
            return done(err)
          }
          done();
        })
    })

    it('should return 400 if password is wrong', (done) => {
      utils.generateLoginRequest("mk6598951@gmail.com", "Nitsp@123")
        .set('x-access-token', '5')
        .expect(400)
        .end( (err, res) => {
          if(err) {
            return done(err)
          }
          done();
        })
    })

  })

})