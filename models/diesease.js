var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var dieaseSchema  =  new Schema({
    patientId:ObjectId,
    doctorId:ObjectId,
    disease:{type:String},
    test:{type:String},
    suggesstion:{type:String},
    medicine:{type:String},
    doctor:{type:String},
    status:{type:Number}

},{
    timestamps:true
})

mongoose.model('Diease',dieaseSchema);