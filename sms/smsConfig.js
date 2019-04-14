var http = require("http");

var options = {
    "method": "POST",
    "hostname": "api.msg91.com",
    "port": null,
    "path": "http://api.msg91.com/api/v2/sendsms",
    "headers": {
      "authkey": "",
      "content-type": "application/json"
    }
};

 exports.sendSms = function(mobileno,code,cb){ 
    var req = http.request(options, function (res) {
        var chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function () {
          var body = Buffer.concat(chunks);
           cb(null,body);
        });
    });
      
    req.write(JSON.stringify({ sender: 'SOCKET',
        route: '4',
        country: '91',
        sms: 
        [{ message: "Your Medical reports has been issued by your doctor please check mail or go to webside",to: [ mobileno] } ] }));
    req.end();

    // cb(null,{"hello":"zello"})   
}
