var mongoose = require('mongoose');
var bcrypt      = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;
var ObjectId    = Schema.ObjectId;

var ClinicSchema = new Schema({
    ccode: { type: Number},    //country code
    mobile_no: { type: Number},    // mobile_no
    email: { type: String},   // email address of user
    first_name: { type: String},    // name of person
    last_name: { type: String},
    sex:{type:String},
    vrfy: { type: Boolean},   // verification done or not
    vrfy_at: { type: Date, default: Date.now },  //verification date
    role: { type: Number},    // verification_date,
    password:{type:String,required:true},
    address:{type:String},
    uni_id:{type:String},
    city:{type:String},
    state:{type:String},
    distric:{type:String},
    pin_code:{type:Number},
    hospital_name:{type:String},
    hospital_type:{type:String},
    test_done:[]
},{
    timestamps:true
})


ClinicSchema.pre("save",function(next){
    var user = this;
    console.log(this);
    if(!user.cat){
        user.cat = new Date
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        console.log(user.password);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
    
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
   
});

ClinicSchema.methods.comparePassword = function(candidatePassword, cb) {
    var user = this;
    bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
        if (err) return cb(err,null);
        cb(null, isMatch);
    });
};

ClinicSchema.statics = {
    ROLE:{
        DOCTER :  1,
        PATIENT : 2,
        CLINIC : 3
    }
}

mongoose.model('Clinic',ClinicSchema);