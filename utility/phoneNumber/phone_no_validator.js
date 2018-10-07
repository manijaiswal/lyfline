var INDIAN_PHONE_REGEX= /^[6789]\d{9}$/;

function phoneNumberValidator(mobileno,ccode){
    if(ccode!=91){
        return false;
    }
    if(isNaN(mobileno)){
        return false;
    }
    return INDIAN_PHONE_REGEX.test(mobileno);
}

module.exports  = phoneNumberValidator;