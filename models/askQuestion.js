var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var askSchema  =  new Schema({
    patientId:ObjectId,
    doctorId:ObjectId,
    question:{type:String}

},{
    timestamps:true
})

mongoose.model('Ask',askSchema);