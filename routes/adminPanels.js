var express   = require('express');
var mongoose  = require('mongoose');
var jwt       = require('jsonwebtoken');

var log4jsLogger = require('../loggers/log4js_module');
var helper       = require('../utility/helpers');
var errorCodes   = require('../utility/errors');
var constants    = require('../utility/constants');
var configs      = require('../utility/configs');
var AuthModule   = require('../utility/auth/auth_token');
var phoneValidator = require('../utility/phoneNumber/phone_no_validator');

require('../models/accounts');



var Account      = mongoose.model('Account');

var router       = express.Router();
var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var logger       = log4jsLogger.getLogger('Admin_panel');


/* ==================middleware for check token is valid or not=======================*/

router.use(function(req,res,next){
    var token  = req.body.token || req.query.token;
    if(!token){
        logger.error({ "url": req.originalUrl, "r": "auth", "msg": "token_not_found" });
        return sendError(res,"Access without token is not authorised","invalid_tokn",constants.BAD_REQUEST);
    }
    jwt.verify(token, configs.JWT_SECRET, function(err, decoded) {
        if (err) {
            console.log(err);
            logger.error({ "url": req.originalUrl, "r": "auth", "msg": "jwt_verify_error", "p": "something went wrong" });
            return sendError(res, "Failed to authenticate token.", "token_auth_failure", constants.TOKEN_EXPIRED);
        } else {
            next();
        }
    });
});

 /* ===================router for read profile of all agent = ===================== */

router.post('/rd_pro',(req,res)=>{
    req.checkBody("aid",errorCodes.invalid_parameters[1]).isValidMongoId();

    
    if(req.validationErrors()){
        logger.error({"r":"rd_pro","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var aid        =  req.body.aid;
    var admin_role =  3;  


    Account.find({_id:aid,role:admin_role},function(err,profile){
        if(err){
            logger.error({"r":"rd_pro","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile.length==0){
            logger.error({"r":"rd_pro","method":"post","msg":"Only admin can do CRUD operations"});
            return sendError(res,"Only admin can do CRUD operations","only_admin_rights",constants.BAD_REQUEST); 
        }

        var role = 2;

        Account.find({role},function(err,profiles){
            if(err){
                logger.error({"r":"rd_pro","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            if(profiles.length==0){
                logger.error({"r":"rd_pro","method":"post","msg":"No agents user find"});
                return sendError(res,"No agents user find","no_agent_user",constants.BAD_REQUEST);   
            }

            return sendSuccess(res,profiles);
        })
    })

});



/* ==============router for delete the agent user by admin=========================*/

router.post('/del_pro',(req,res)=>{
    req.checkBody("aid",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody("agent_aid",errorCodes.invalid_parameters[1]).isValidMongoId();

    if(req.validationErrors()){
        logger.error({"r":"del_pro","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var aid       =  req.body.aid;
    var agent_aid =  req.body.agent_aid;
    var admin_role=  3;

    Account.find({_id:aid,role:admin_role},function(err,profile){
        if(err){
            logger.error({"r":"del_pro","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile.length==0){
            logger.error({"r":"rd_pro","method":"post","msg":"Only admin can do CRUD operations"});
            return sendError(res,"Only admin can do CRUD operations","only_admin_rights",constants.BAD_REQUEST); 
        }
        var agent_role = 2;

        Account.find({_id:agent_aid,role:agent_role},function(err,agent){
            if(err){
                logger.error({"r":"del_pro","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            if(agent.length==0){
                logger.error({"r":"del_pro","method":"post","msg":"No agents user find"});
                return sendError(res,"No agents user find","no_agent_user",constants.BAD_REQUEST);   
            }

            var id = agent[0]._id;


            Account.remove({_id:id,role:2},function(err,success_del){
                if(err){
                    logger.error({"r":"del_pro","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                return sendSuccess(res,success_del);
            })
        })
    })    
})



/* === routes for update agents profile by admin===================*/

router.post('/ed_pro',(req,res)=>{
    req.checkBody("aid",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody("agent_aid",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody('address',errorCodes.invalid_parameters[1]).optional();
    req.checkBody('city',errorCodes.invalid_parameters[1]).optional();
    req.checkBody('state',errorCodes.invalid_parameters[1]).optional();
    req.checkBody('country',errorCodes.invalid_parameters[1]).optional();
    req.checkBody('pin_code',errorCodes.invalid_parameters[1]).optional();

    if(req.validationErrors()){
        logger.error({"r":"del_pro","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var aid       =  req.body.aid;
    var agent_aid =  req.body.agent_aid;
    var admin_role=  3;

    Account.find({_id:aid,role:admin_role},function(err,profile){
        if(err){
            logger.error({"r":"del_pro","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile.length==0){
            logger.error({"r":"rd_pro","method":"post","msg":"Only admin can do CRUD operations"});
            return sendError(res,"Only admin can do CRUD operations","only_admin_rights",constants.BAD_REQUEST); 
        }


        Account.find({_id:agent_aid,role:2},function(err,agent){
            if(err){
                logger.error({"r":"del_pro","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            if(agent.length==0){
                logger.error({"r":"del_pro","method":"post","msg":"No agents user find"});
                return sendError(res,"No agents user find","no_agent_user",constants.BAD_REQUEST);   
            }

            var id = agent[0]._id;
            var toeditobj = {};

            if("address" in req.body){
                toeditobj['address'] = req.body.address;
            }

            if('city' in req.body){
                toeditobj['city'] = req.body.city;
            }

            if('state' in req.body){
                toeditobj['state'] = req.body.state;
            }

            if('country' in req.body){
                toeditobj['country'] = req.body.country;
            }

            if('pin_code' in req.body){
                toeditobj['pin_code'] = req.body.pin_code;
            }

            console.log(toeditobj);

            Account.update({_id:agent_aid,role:2},toeditobj,function(err,updated_success){
                if(err){
                    logger.error({"r":"del_pro","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                return sendSuccess(res,updated_success);
            })


        })
    })
    
})


module.exports = router;