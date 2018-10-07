var mongoose    =   require('mongoose');
var bcrypt      = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Schema      = mongoose.Schema;
var ObjectId    = Schema.ObjectId;

var ProfileSchema  = new Schema({
    aid    : ObjectId,
    mobile_no:{type:Number,required:true},
    name   : {type:String,required:true},
    email  : {type:String,required:false},
    cat    : {type:Date,default: Date.now}, // profile creation date
    role   : {type:Number,required:true},
    password:{type:String},
    address:{type:String},
    city:{type:String},
    state:{type:String},
    country:{type:String},
    pin_code:{type:Number}
},
{
    timestamps : true
}
);


ProfileSchema.pre("save",function(next){
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

ProfileSchema.methods.comparePassword = function(candidatePassword, cb) {
    var user = this;
    bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
        if (err) return cb(err,null);
        cb(null, isMatch);
    });
};

ProfileSchema.statics = {
    ROLE:{
        USER :  1,
        AGENT : 2,
        ADMIN : 3
    }
}

mongoose.model('Profile',ProfileSchema);
