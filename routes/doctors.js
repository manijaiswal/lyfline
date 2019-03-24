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
var {sendMedicine,sendContactInfo} = require("../mail-gun/sendMail");
var {sendSms,sendContact}     =  require('../sms/smsConfig'); 

require('../models/accounts');
require('../models/accounts/doctors');
require('../models/emailCodes');
require('../models/accounts/patients');
require('../models/accounts/clinics');
require('../models/treatment');
require('../models/diesease');
require('../models/askQuestion');
require('../models/reports');


var Account      = mongoose.model('Account');
var Doctor       = mongoose.model('Doctor');
var EmailOtp     = mongoose.model('EmailOtp');
var Patient      = mongoose.model('Patient');
var Clinic       = mongoose.model('Clinic');
var Treatment    = mongoose.model('Treatment');
var Diease       = mongoose.model('Diease');
var Ask          = mongoose.model("Ask");
var Report       = mongoose.model('Report');

var router       = express.Router();
var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var logger       = log4jsLogger.getLogger('Doctors');


router.post('/totalPatient_dtl',(req,res)=>{
    req.checkBody("doctorId",errorCodes.invalid_parameters[1]).isValidMongoId();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var doctorId = req.body.doctorId    
    Doctor.find({_id:doctorId},function(err,profile_data){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile_data.length==0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        Diease.find({doctorId},function(err,patientsTreat){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            var patientsTreatArr = patientsTreat;
            Patient.find({},function(err,patients){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var patientArr = patients;
                var finalArr = [];
                

                for(var i=0;i<patientsTreatArr.length;i++){
                    var dataObj = {};
                    dataObj['treat'] = patientsTreatArr[i];
                    for(var j=0;j<patientArr.length;j++){
                        if(patientArr[j]['_id'].equals(patientsTreatArr[i]['patientId'])){
                           dataObj['patient'] = patientArr[j];
                        }
                    }

                    finalArr.push(dataObj);
                }

                return sendSuccess(res,finalArr);

            })
        })
    })    
})



router.post('/patient_dtl',(req,res)=>{
    req.checkBody("patientId",errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var doctorId = req.body.doctorId;
    var patientId = req.body.patientId

    var data = {}

    Patient.find({uni_id:patientId},function(err,patient){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(patient.length==0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        var patientId = patient[0]['_id'];
        data['patient'] = patient[0] 

        Diease.find({patientId},function(err,diseaseData){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }
            data['previousHistory'] = diseaseData
            return sendSuccess(res,data);
        })  
    })
});



/*=================routes  for create trement=======================*/

router.post('/cr_medicine',(req,res)=>{
    req.checkBody("doctorId",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody("patientId",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody("disease",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("test",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("suggesstion",errorCodes.invalid_parameters[1]).optional();
    req.checkBody("medicine",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("status",errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var doctorId = req.body.doctorId;
    var patientId = req.body.patientId
    var disease   = req.body.disease;
    var test      = req.body.test;
    var medicine    = req.body.medicine
    var status    = req.body.status;

    Patient.find({_id:patientId},function(err,patient){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(patient.length==0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        var email = patient[0]['email'];
        var mobileno = patient[0]['mobile_no']

        Doctor.find({_id:doctorId},function(err,doctor){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            if(doctor.length==0){
                logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
                return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
            }

            var doctor = doctor[0]['first_name']

            var save_obj = {patientId,doctorId,disease,test,medicine,doctor,status}
            
            if("suggesstion" in req.body){
                save_obj['suggesstion'] = req.body.suggesstion;
            }

            var diesease = new Diease(save_obj);

            diesease.save(function(err,saveData){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var arr = [];
                arr.push(saveData)
                console.log(arr)
                sendMedicine(arr,email,function(err,emailSentSuccess){
                    if (err) {
                        logger.error({ "r": "send_email", "method": 'post', "msg": err });
                        console.log("hdhhd", err);
                        return sendSuccess(res,saveData); 
                    }

                    sendSms(mobileno,91,function(err,data){
                        if(err){
                            return sendSuccess(res,saveData);
                        }

                        return sendSuccess(res,saveData);
                    })

                    
                })
            })
        })
    })    
});




/*=================routes for read history of patient==================*/

router.post('/rd_patient_his',(req,res)=>{
    req.checkBody("patientId",errorCodes.invalid_parameters[1]).isValidMongoId();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

   
    var patientId = req.body.patientId;
    var data = {};
    Patient.find({_id:patientId},function(err,patient){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(patient.length==0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        data['profile'] = patient[0];
        var patientId =  patient[0]['_id'];
        console.log(patientId)
        Diease.find({patientId},function(err,diseaseData){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }
            data['history'] = diseaseData
            return sendSuccess(res,data);
        }) 
    })    
});


router.post('/ask_ques',(req,res)=>{

})



router.post('/cr_report',(req,res)=>{
    req.checkBody("patientId",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody("clinicId",errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody("disease",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("test",errorCodes.invalid_parameters[1]).notEmpty();
    // req.checkBody("link",errorCodes.invalid_parameters[1]).notEmpty();


    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var clinicId = req.body.clinicId;
    var patientId = req.body.patientId
    var disease   = req.body.disease;
    var test      = req.body.test;
    var link      = 'https://drive.google.com/file/d/115eNQGsUXf6JAaGk93Jany0_Fv-V9_I4/view';


    Patient.find({_id:patientId},function(err,patient){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(patient.length==0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        var email = patient[0]['email']
        var mobileno = patient[0]['mobile_no']

        var save_obj = {clinicId,patientId,disease,test,link}

        var report  = new Report(save_obj);

        report.save(function(err,saveData){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            var arr = [];
            arr.push(saveData)
            sendMedicine(arr,email,function(err,emailSentSuccess){
                if (err) {
                    logger.error({ "r": "send_email", "method": 'post', "msg": err });
                    console.log("hdhhd", err);
                    return sendSuccess(res,saveData); 
                }

                sendSms(mobileno,91,function(err,data){
                    if(err){
                        return sendSuccess(res,saveData);
                    }

                    return sendSuccess(res,saveData);
                })
            })

        })
       
    })    
});


router.post('/totalReport_dtl',(req,res)=>{
    req.checkBody("clinicId",errorCodes.invalid_parameters[1]).isValidMongoId();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var clinicId = req.body.clinicId;    
    Clinic.find({_id:clinicId},function(err,profile_data){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile_data.length==0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        Report.find({clinicId},function(err,patientsTreat){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            var patientsTreatArr = patientsTreat;
            Patient.find({},function(err,patients){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var patientArr = patients;
                var finalArr = [];
                

                for(var i=0;i<patientsTreatArr.length;i++){
                    var dataObj = {};
                    dataObj['treat'] = patientsTreatArr[i];
                    for(var j=0;j<patientArr.length;j++){
                        if(patientArr[j]['_id'].equals(patientsTreatArr[i]['patientId'])){
                           dataObj['patient'] = patientArr[j];
                        }
                    }

                    finalArr.push(dataObj);
                }

                return sendSuccess(res,finalArr);

            })
        })
    })    
});


router.post('/tot_doc',(req,res)=>{

    // req.checkBody("state",errorCodes.invalid_parameters[1]).optional();
    // req.checkBody("spec",errorCodes.invalid_parameters[1]).optional();

    // if("state" in req.body){

    // }
    Doctor.find({},function(err,doctors){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        return sendSuccess(res,doctors);
    })
})


router.post('/rd_patient_pro',(req,res)=>{
    req.checkBody("aid",errorCodes.invalid_parameters[1]).isValidMongoId();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var aid = req.body.aid;

    Patient.find({_id:aid},function(err,profile){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        return sendSuccess(res,profile);
    })

});


/*=====================routes for send contact information to SAmart user ===================*/
router.post('/sendMailAndMsg',(req,res)=>{
    req.checkBody("name",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("mobile",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("email",errorCodes.invalid_parameters[1]).isValidEmail();
    req.checkBody("subject",errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody("desc",errorCodes.invalid_parameters[1]).optional();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var name   = req.body.name;
    var mobile = req.body.mobile;
    var email  = req.body.email;
    var subject = req.body.subject;
    var save_obj = {name,mobile,email,subject};

    if("desc" in req.body){
        save_obj['desc'] = req.body.desc;
    }

    var arr = [];
    arr.push(save_obj);

    console.log(save_obj);
    sendContactInfo(arr,'mk6598951@gmail.com',function(err,emailSentSuccess){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        sendContact(7004324388,91,save_obj,function(err,success){
            if(err){
                logger.error({"r":"cr_acc","method":'post',"msg":err});
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }
            return sendSuccess(res,emailSentSuccess);
        })   
    })  
})

module.exports = router;



