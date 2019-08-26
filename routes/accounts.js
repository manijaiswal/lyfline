var express   = require('express');
var mongoose  = require('mongoose');
var jwt       = require('jsonwebtoken');
const shortid = require('shortid');

var log4jsLogger = require('../loggers/log4js_module');
var helper       = require('../utility/helpers');
var errorCodes   = require('../utility/errors');
var constants    = require('../utility/constants');
var configs      = require('../utility/configs');
var AuthModule   = require('../utility/auth/auth_token');
var otp_generator = require('../utility/code_generator');
var phoneValidator = require('../utility/phoneNumber/phone_no_validator');
var {sendOtpMail} = require("../mail-gun/sendMail");  

require('../models/accounts');
require('../models/accounts/doctors');
require('../models/emailCodes');
require('../models/accounts/patients');
require('../models/accounts/clinics');




var Account      = mongoose.model('Account');
var Doctor       = mongoose.model('Doctor');
var EmailOtp     = mongoose.model('EmailOtp');
var Patient      = mongoose.model('Patient');
var Clinic       = mongoose.model('Clinic');

var router       = express.Router();
var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var logger       = log4jsLogger.getLogger('Account');


/*==========================routes for create account ====================================== */

/*=================routes for create doctor account ====================*/

router.post('/cr_acc_doc',(req,res)=>{
    req.checkBody('ccode',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('mobile_no',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('email',errorCodes.invalid_parameters[1]).optional().isValidEmail();
    req.checkBody('first_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('last_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('spec',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('sex',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('role',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('address',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('city',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('state',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('distric',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pin_code',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('hospital_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('hospital_type',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var ccode     = req.body.ccode;
    var mobile_no = req.body.mobile_no;
    var email     = req.body.email;
    var first_name= req.body.first_name;
    var last_name = req.body.last_name;
    var spec      = req.body.spec;
    var sex       = req.body.sex; 
    var role      = req.body.role;
    var vrfy      = false;
    var password  = req.body.password;
    var address   = req.body.address;
    var city      = req.body.city;
    var state     = req.body.state;
    var distric   = req.body.distric;
    var pin_code  = req.body.pin_code;
    var hospital_name = req.body.hospital_name;
    var hospital_type = req.body.hospital_type;



    var phoneValidationStatus = phoneValidator(mobile_no,ccode);

    if(!phoneValidationStatus){
        logger.error({"r":"cr_acc","method":"post","msg":"phone Number invalid"});
        return sendError(res,"phone Number is not valid","phone_no_invalid",constants.BAD_REQUEST);
    }

    if(password.length<6){
        logger.error({"r":"cr_acc","method":"post","msg":"password length should be greater than 6"});
        return sendError(res,"password length should be greater than 6","password_length",constants.BAD_REQUEST);
    }

    var data = {};


    Doctor.find({mobile_no,email,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile_data.length>0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account already exists"});
            return sendError(res,"Account already exists","account_already_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length==0){

            vrfy = false;
            var vrfy_at = new Date();

            var saveObj = {ccode,mobile_no,email,first_name,last_name,sex,spec,vrfy,vrfy_at,role,password,address,city,state,distric,pin_code,hospital_name,hospital_type};

            var account = new Doctor(saveObj);

            account.save(function(err,account_save){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var aid  = account_save['_id'];
                generateEmailCode(aid,email,function(err,genereted_otp){
                    if(err){
                        logger.error({ "r": "cr_acc", "method": 'post', "msg": err });
                        return sendError(res, err, "email_not_sent", constants.SERVER_ERROR);
                    }
                    return sendSuccess(res,account_save);

                })
            })

        }
    })

})

router.post('/verify_email', (req, res) => {
    req.checkBody('aid', errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody('code', errorCodes.invalid_parameters[1]).notEmpty();

    if (req.validationErrors()) {
        logger.error({ "r": "verify_email", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }

    var aid = req.body.aid;
    var code = req.body.code;
    var status = EmailOtp.STATUS.NOT_USED;
    var data = {};

    EmailOtp.find({ aid, code, status }, function (err, otp_data) {
        if (err) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        if (otp_data.length == 0) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": "Otp is invalid or used" });
            return sendError(res, "Otp is invalid or used", "otp_invalid", constants.BAD_REQUEST);
        }

        var email_otp_id = otp_data[0]._id;
        Doctor.find({ _id: aid }, function (err, account_data) {
            if (err) {
                logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                return sendError(res, err, "server_error", constants.SERVER_ERROR);
            }

            var acc_id = account_data[0]['_id']
            var uni_id = shortid.generate()

            data['account'] = account_data[0]
            Doctor.updateOne({ _id: acc_id }, { vrfy: true,uni_id:uni_id}, function (err, update_account) {
                if (err) {
                    logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                    return sendError(res, err, "server_error", constants.SERVER_ERROR);
                }

                var token = AuthModule.getAT({ id: aid });
                data['token'] = token;
                data['uni_id'] = uni_id;

                var used_status = EmailOtp.STATUS.USED;

                EmailOtp.updateOne({ _id: email_otp_id }, { status: used_status }, function (err, update_email) {
                    if (err) {
                        logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                        return sendError(res, err, "server_error", constants.SERVER_ERROR);
                    }

                    return sendSuccess(res, data);
                })
            })
        })
    })
});


/*================routes for create patient account ================*/

router.post('/cr_acc_pat',(req,res)=>{
    req.checkBody('ccode',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('mobile_no',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('email',errorCodes.invalid_parameters[1]).optional().isValidEmail();
    req.checkBody('first_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('last_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('sex',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('role',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('address',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('mart_sts',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('par_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('par_sex',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('par_mob',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('par_rel',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('dob',errorCodes.invalid_parameters[1]).optional();


    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var ccode     = req.body.ccode;
    var mobile_no = req.body.mobile_no;
    var email     = req.body.email;
    var first_name= req.body.first_name;
    var last_name = req.body.last_name;
    var sex       = req.body.sex; 
    var role      = req.body.role;
    var vrfy      = false;
    var password  = req.body.password;
    var address   = req.body.address;
    var mart_sts  = req.body.mart_sts;
    var par_name  = req.body.par_name;
    var par_sex   = req.body.par_sex;
    var par_mob   = req.body.par_mob;
    var par_rel   = req.body.par_rel;

    var phoneValidationStatus = phoneValidator(mobile_no,ccode);

    if(!phoneValidationStatus){
        logger.error({"r":"cr_acc","method":"post","msg":"phone Number invalid"});
        return sendError(res,"phone Number is not valid","phone_no_invalid",constants.BAD_REQUEST);
    }

    if(password.length<6){
        logger.error({"r":"cr_acc","method":"post","msg":"password length should be greater than 6"});
        return sendError(res,"password length should be greater than 6","password_length",constants.BAD_REQUEST);
    }

    var data = {};


    Patient.find({mobile_no,email,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile_data.length>0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account already exists"});
            return sendError(res,"Account already exists","account_already_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length==0){

            vrfy = false;
            var vrfy_at = new Date();
            
            var saveObj = {ccode,mobile_no,email,first_name,last_name,sex,vrfy,vrfy_at,role,password,address,mart_sts,par_name,par_sex,par_mob,par_rel};

            if("dob" in req.body){
                saveObj['dob'] = req.body.dob;
            }

            var account = new Patient(saveObj);

            account.save(function(err,account_save){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var aid  = account_save['_id'];
                generateEmailCode(aid,email,function(err,genereted_otp){
                    if(err){
                        logger.error({ "r": "cr_acc", "method": 'post', "msg": err });
                        return sendError(res, err, "email_not_sent", constants.SERVER_ERROR);
                    }
                    return sendSuccess(res,account_save);

                })
            })

        }
    })

})

router.post('/verify_email_pat', (req, res) => {
    req.checkBody('aid', errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody('code', errorCodes.invalid_parameters[1]).notEmpty();

    if (req.validationErrors()) {
        logger.error({ "r": "verify_email", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }

    var aid = req.body.aid;
    var code = req.body.code;
    var status = EmailOtp.STATUS.NOT_USED;
    var data = {};

    EmailOtp.find({ aid, code, status }, function (err, otp_data) {
        if (err) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        if (otp_data.length == 0) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": "Otp is invalid or used" });
            return sendError(res, "Otp is invalid or used", "otp_invalid", constants.BAD_REQUEST);
        }

        var email_otp_id = otp_data[0]._id;
        Patient.find({ _id: aid }, function (err, account_data) {
            if (err) {
                logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                return sendError(res, err, "server_error", constants.SERVER_ERROR);
            }

            var acc_id = account_data[0]['_id']
            var uni_id = shortid.generate()

            data['account'] = account_data[0]
            Patient.updateOne({ _id: acc_id }, { vrfy: true,uni_id:uni_id}, function (err, update_account) {
                if (err) {
                    logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                    return sendError(res, err, "server_error", constants.SERVER_ERROR);
                }

                var token = AuthModule.getAT({ id: aid });
                data['token'] = token;
                data['uni_id'] = uni_id;

                var used_status = EmailOtp.STATUS.USED;

                EmailOtp.updateOne({ _id: email_otp_id }, { status: used_status }, function (err, update_email) {
                    if (err) {
                        logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                        return sendError(res, err, "server_error", constants.SERVER_ERROR);
                    }

                    return sendSuccess(res, data);
                })
            })
        })
    })
});




/*===============routes for create account for clinic =================*/

router.post('/cr_acc_cli',(req,res)=>{
    req.checkBody('ccode',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('mobile_no',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('email',errorCodes.invalid_parameters[1]).optional().isValidEmail();
    req.checkBody('first_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('last_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('sex',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('role',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('address',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('city',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('state',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('distric',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pin_code',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('hospital_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('hospital_type',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('test_done',errorCodes.invalid_parameters[1]).notEmpty();
    

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var ccode     = req.body.ccode;
    var mobile_no = req.body.mobile_no;
    var email     = req.body.email;
    var first_name= req.body.first_name;
    var last_name = req.body.last_name;
    var sex       = req.body.sex; 
    var role      = req.body.role;
    var vrfy      = false;
    var password  = req.body.password;
    var address   = req.body.address;
    var city      = req.body.city;
    var state     = req.body.state;
    var distric   = req.body.distric;
    var pin_code  = req.body.pin_code;
    var hospital_name = req.body.hospital_name;
    var hospital_type = req.body.hospital_type;
    var test_done   =  req.body.test_done;

    var phoneValidationStatus = phoneValidator(mobile_no,ccode);

    if(!phoneValidationStatus){
        logger.error({"r":"cr_acc","method":"post","msg":"phone Number invalid"});
        return sendError(res,"phone Number is not valid","phone_no_invalid",constants.BAD_REQUEST);
    }

    if(password.length<6){
        logger.error({"r":"cr_acc","method":"post","msg":"password length should be greater than 6"});
        return sendError(res,"password length should be greater than 6","password_length",constants.BAD_REQUEST);
    }

    var data = {};


    Clinic.find({mobile_no,email,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile_data.length>0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account already exists"});
            return sendError(res,"Account already exists","account_already_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length==0){

            vrfy = false;
            var vrfy_at = new Date();

            var saveObj = {ccode,mobile_no,email,first_name,last_name,sex,vrfy,vrfy_at,role,password,address,city,distric,state,pin_code,hospital_name,hospital_type,test_done};

            var account = new Clinic(saveObj);

            account.save(function(err,account_save){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var aid  = account_save['_id'];
                generateEmailCode(aid,email,function(err,genereted_otp){
                    if(err){
                        logger.error({ "r": "cr_acc", "method": 'post', "msg": err });
                        return sendError(res, err, "email_not_sent", constants.SERVER_ERROR);
                    }
                    return sendSuccess(res,account_save);

                })
            })

        }
    })

})

router.post('/verify_email_cli', (req, res) => {
    req.checkBody('aid', errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody('code', errorCodes.invalid_parameters[1]).notEmpty();

    if (req.validationErrors()) {
        logger.error({ "r": "verify_email", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }

    var aid = req.body.aid;
    var code = req.body.code;
    var status = EmailOtp.STATUS.NOT_USED;
    var data = {};

    EmailOtp.find({ aid, code, status }, function (err, otp_data) {
        if (err) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        if (otp_data.length == 0) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": "Otp is invalid or used" });
            return sendError(res, "Otp is invalid or used", "otp_invalid", constants.BAD_REQUEST);
        }

        var email_otp_id = otp_data[0]._id;
        Clinic.find({ _id: aid }, function (err, account_data) {
            if (err) {
                logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                return sendError(res, err, "server_error", constants.SERVER_ERROR);
            }

            var acc_id = account_data[0]['_id']
            var uni_id = shortid.generate()

            data['account'] = account_data[0]
            Clinic.updateOne({ _id: acc_id }, { vrfy: true,uni_id:uni_id}, function (err, update_account) {
                if (err) {
                    logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                    return sendError(res, err, "server_error", constants.SERVER_ERROR);
                }

                var token = AuthModule.getAT({ id: aid });
                data['token'] = token;
                data['uni_id'] = uni_id;

                var used_status = EmailOtp.STATUS.USED;

                EmailOtp.updateOne({ _id: email_otp_id }, { status: used_status }, function (err, update_email) {
                    if (err) {
                        logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                        return sendError(res, err, "server_error", constants.SERVER_ERROR);
                    }

                    return sendSuccess(res, data);
                })
            })
        })
    })
});


/* ==================middle ware for check token===================*/

// router.use(function(req,res,next){
//     var token = req.body.token || req.query.token;
//     console.log(req.body)
//     if(!token){
//         logger.error({ "url": req.originalUrl, "r": "auth", "msg": "token_not_found" });
//         return sendError(res,"Access without token is not authorised","invalid_tokn",constants.BAD_REQUEST);
//     }
//     if(token==5 || token == '5'){
//         next();
//     }
       
// })


/*===================routes for login ================================ */


router.post('/login_doc',(req,res)=>{
    req.checkBody('email',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('role',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"login","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var email = req.body.email;
    var role      = req.body.role;
    var password  = req.body.password;

    // var phoneValidationStatus = phoneValidator(mobile_no,ccode);

    // if(!phoneValidationStatus){
    //     logger.error({"r":"login","method":"post","msg":"phone Number invalid"});
    //     return sendError(res,"phone Number is not valid","phone_no_invalid",constants.BAD_REQUEST);
    // }

    Doctor.find({email,role,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"login","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }  

        if(profile_data.length==0){
            logger.error({"r":"login","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length>0){
            var data = {};
            var profile = profile_data[0];
            var aid     = profile_data[0]['_id'];

            profile.comparePassword(password,function(err,success_data){
                if(err){
                    console.log("err",err);
                    logger.error({"r":"login","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                if(success_data){
                    var token = AuthModule.getAT({id:aid});
                    data['token'] = token;
                    data['profile_data'] = profile;
    
                    return sendSuccess(res,data);
                }
                else{
                    logger.error({"r":"login","method":'post',"msg":"Password not match with this number"});
                    return sendError(res,"Password not match with this number","password_not_match",constants.BAD_REQUEST); 
                }
            })

        }
    })

});


router.post('/login_pat',(req,res)=>{
    req.checkBody('email',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('role',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"login","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var email = req.body.email;
    var role      = req.body.role;
    var password  = req.body.password;

    // var phoneValidationStatus = phoneValidator(mobile_no,ccode);

    // if(!phoneValidationStatus){
    //     logger.error({"r":"login","method":"post","msg":"phone Number invalid"});
    //     return sendError(res,"phone Number is not valid","phone_no_invalid",constants.BAD_REQUEST);
    // }

    Patient.find({email,role,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"login","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }  

        if(profile_data.length==0){
            logger.error({"r":"login","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length>0){
            var data = {};
            var profile = profile_data[0];
            var aid     = profile_data[0]['_id'];

            profile.comparePassword(password,function(err,success_data){
                if(err){
                    console.log("err",err);
                    logger.error({"r":"login","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                if(success_data){
                    var token = AuthModule.getAT({id:aid});
                    data['token'] = token;
                    data['profile_data'] = profile;
    
                    return sendSuccess(res,data);
                }
                else{
                    logger.error({"r":"login","method":'post',"msg":"Password not match with this number"});
                    return sendError(res,"Password not match with this number","password_not_match",constants.BAD_REQUEST); 
                }
            })

        }
    })

});


router.post('/login_cli',(req,res)=>{
    req.checkBody('email',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('role',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"login","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var email = req.body.email;
    var role      = req.body.role;
    var password  = req.body.password;

    // var phoneValidationStatus = phoneValidator(mobile_no,ccode);

    // if(!phoneValidationStatus){
    //     logger.error({"r":"login","method":"post","msg":"phone Number invalid"});
    //     return sendError(res,"phone Number is not valid","phone_no_invalid",constants.BAD_REQUEST);
    // }

    Clinic.find({email,role,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"login","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }  

        if(profile_data.length==0){
            logger.error({"r":"login","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length>0){
            var data = {};
            var profile = profile_data[0];
            var aid     = profile_data[0]['_id'];

            profile.comparePassword(password,function(err,success_data){
                if(err){
                    console.log("err",err);
                    logger.error({"r":"login","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                if(success_data){
                    var token = AuthModule.getAT({id:aid});
                    data['token'] = token;
                    data['profile_data'] = profile;
    
                    return sendSuccess(res,data);
                }
                else{
                    logger.error({"r":"login","method":'post',"msg":"Password not match with this number"});
                    return sendError(res,"Password not match with this number","password_not_match",constants.BAD_REQUEST); 
                }
            })

        }
    })

});




function generateEmailCode(account_id, email, cb) {
    var aid = account_id;
    var code = otp_generator(configs.OTP_LENGTH);
    var status = EmailOtp.STATUS.NOT_USED;

    var emailCode = new EmailOtp({ aid, code, status });

    var data = [];
    var data_obj = {};

    emailCode.save(function (err) {
        if (err) {
            logger.error({ "r": "send_email", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        data_obj['code'] = code;
        data_obj['tim'] = new Date().toLocaleDateString();

        data.push(data_obj);
        console.log(data);
        sendOtpMail(data, email, function (err, emailSentSuccess) {
            if (err) {
                logger.error({ "r": "send_email", "method": 'post', "msg": err });
                console.log("hdhhd", err);
                cb(err, null);
            }

            cb(null, emailSentSuccess);

        })
    })
}



module.exports = router;