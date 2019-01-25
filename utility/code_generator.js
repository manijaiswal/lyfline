function otp_generator(size){
    var code = '';
    
    for(var i=0;i<size;i++){
        if(i==0){
            code+= 1+ Math.floor(Math.random()*10);
        }
        else{
            code+= Math.floor(Math.random()*9);
        }
    }
    console.log(code);
    return code;
}

module.exports = otp_generator;