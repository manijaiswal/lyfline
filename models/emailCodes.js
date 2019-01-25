var mongoose       =     require('mongoose');

var Schema         =    mongoose.Schema;
var ObjectId       =    Schema.ObjectId;

var EmailSchema  =  new Schema({
    aid:    ObjectId,  
    code: {type:String},
    status:{type:Number}
},{
    timestamps:true
});


EmailSchema.statics = {
    STATUS:{
        NOT_USED:1,
        USED:2,
        PENDING:3,
        FAILED:4
    }
}

mongoose.model('EmailOtp',EmailSchema);