var jwt     = require('jsonwebtoken');
var configs = require('../configs');

exports.getAT  = function(object_for_payload){

    object_for_payload.hascode = randomNumberOfLength(configs.RANDOM_NUMBER_LENGTH);
    return jwt.sign(object_for_payload,configs.JWT_SECRET,{expiresIn: configs.TOKEN_EXPRIES_TIME });
}


function randomNumberOfLength(length) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1)) ;
}