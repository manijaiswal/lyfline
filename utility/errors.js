var errors ={
    "invalid_parameters"   :    [100,'Invalid Parameters'],
    "server_error"         :    [200,'Server Error'],
    "phone_no_invalid"     :    [300,'Mobile Number is not valid'],
    "password_length"      :    [400,"password must be greater than 6"],
    "account_already_exists":    [500,"account already exists"],
    "invalid_tokn"          :    [600,"Access without token is not authorised"],
    "account_not_exists"    :    [700,"Account doesnot exists"],
    "password_not_match"    :    [800,"Password not match with this number"],
    "only_admin_rights"     :    [900,"Only admin can do CRUD operations"],
    "no_agent_user"         :    [1000,"No agnet user find"],
    "email_not_sent"        :    [1050,"Email sending failed"],
    "otp_invalid"           :    [1100,"otp is not valid or used"]
}


module.exports = errors;