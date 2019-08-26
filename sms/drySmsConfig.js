var http = require("http");

var options = {
    "method": "POST",
    "hostname": "api.msg91.com",
    "port": null,
    "path": "http://api.msg91.com/api/v2/sendsms?country=91",
    "headers": {
      "authkey": "289717AEneRIdB535d55670c",
      "content-type": "application/json"
    }
};


exports.bookingMsgToAdmin  = function(msg,cb){
    var msg_str =  msg.name+"whose mobile"+msg.mobile_no+"wants to contact you regarding"+msg.services+"."+msg.desc;
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
        route: '1',
        country: '91',
        sms: 
        [{ message: msg_str, to: ['7004324388'] }] }));
    req.end();
}




