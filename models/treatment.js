var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var treatmentSchema  =  new Schema({
    doctorId:ObjectId,
    patientId:ObjectId,
    pres:{type:String},
    disease:{type:String},
    status:{type:String}
})


mongoose.model('Treatment',treatmentSchema)