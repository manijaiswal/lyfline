var http = require("http");

var options = {
    "method": "POST",
    "hostname": "api.msg91.com",
    "port": null,
    "path": "http://api.msg91.com/api/v2/sendsms",
    "headers": {
      "authkey": "234710Az7RWMuUS5b87f8f4",
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



exports.sendContact = function(mobileno,code,data,cb){ 

    var messageStr = "hello"+data['name']+"has intrested in your"+data['subject']+".His contact inforamtion is"+data['mobile']+"email="+data['email'];
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
        [{ message: messageStr,to: [ mobileno] } ] }));
    req.end();

    // cb(null,{"hello":"zello"})   
}

