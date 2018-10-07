var errorCodes = require('./errors');
var constants  = require('./constants');

module.exports ={
    sendError: function(res,err,error_index,status_code){
        console.trace(err);
        if(typeof(error_index)==undefined){
            status_code = constants.SERVER_ERROR;
        }

        res.status(status_code).json({
            code:errorCodes[error_index][0],
            message:errorCodes[error_index][1],
            success:false
        })
        return;
    },
    sendSuccess: function(res,data){
        res.status(constants.OK).json({
            success:true,
            data:data
        })
    }
}

