var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var reportSchema  =  new Schema({
    patientId:ObjectId,
    clinicId:ObjectId,
    link:{type:String},
    test:{type:String},
    disease:{type:String}
},{
    timestamps:true
})

mongoose.model('Report',reportSchema);