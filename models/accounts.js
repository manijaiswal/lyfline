var mongoose = require('mongoose');
var bcrypt      = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;
var ObjectId    = Schema.ObjectId;

var AccountSchema = new Schema({
    ccode: { type: Number, required: true },    //country code
    mobile_no: { type: Number, required: true },    // mobile_no
    email: { type: String, required: false },   // email address of user
    name: { type: String, required: true },    // name of person
    vrfy: { type: Boolean, required: true },   // verification done or not
    vrfy_at: { type: Date, default: Date.now },  //verification date
    role: { type: Number, required: true },    // verification_date,
    password:{type:String,required:true},
    address:{type:String},
    city:{type:String},
    state:{type:String},
    country:{type:String},
    pin_code:{type:Number}

},{
    timestamps:true
})


AccountSchema .pre("save",function(next){
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

AccountSchema.methods.comparePassword = function(candidatePassword, cb) {
    var user = this;
    bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
        if (err) return cb(err,null);
        cb(null, isMatch);
    });
};

AccountSchema.statics = {
    ROLE:{
        USER :  1,
        AGENT : 2,
        ADMIN : 3
    }
}



mongoose.model('Account', AccountSchema);