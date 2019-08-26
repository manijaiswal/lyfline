var express   = require('express');
var mongoose  = require('mongoose');

var log4jsLogger = require('../loggers/log4js_module');
var helper       = require('../utility/helpers');
var errorCodes   = require('../utility/errors');
var constants    = require('../utility/constants')
var configs      = require('../utility/configs');
var AuthModule   = require('../utility/auth/auth_token');
var {bookingMsgToAdmin}     = require('../sms/drySmsConfig');
var phoneValidator = require('../utility/phoneNumber/phone_no_validator');


var router       = express.Router();
var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var logger       = log4jsLogger.getLogger('DryCleaning');


router.post('/contact_us', (req, res) => {
    req.checkBody('name', errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('email', errorCodes.invalid_parameters[1]).optional();
    req.checkBody('mobile', errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('services', errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('desc', errorCodes.invalid_parameters[1]).optional();

    if (req.validationErrors()) {
        logger.error({ "r": "contact_us", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }


    var name = req.body.name;
    var mobile = req.body.mobile;
    var desc = req.body.desc;
    var services = req.body.services;
    var ccode = 91;

    var phoneValidationStatus = phoneValidator(mobile, ccode);
    if (!phoneValidationStatus) {
        logger.error({ "r": "contact_us", "method": "post", "msg": "phone Number invalid" });
        return sendError(res, "phone Number is not valid", "phone_no_invalid", constants.BAD_REQUEST);
    }
    var tim = new Date().toLocaleDateString();
    var obj = {name,mobile,desc,services,ccode};

    if("email" in req.body){
        obj['email'] = req.body.email;
    }

    bookingMsgToAdmin(obj,function(err,sendMsg){
        if(err){
            console.log(err);
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }
        return sendSuccess(res,sendMsg);
    })




})

module.exports  = router;