var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');  // UA-128066028-1

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eduvysupervision@gmail.com',
        pass: 'Manish@1234',
        clientId: '490182794397-i958cpolm0vkbr7gf8iovbuoa4akk7s2.apps.googleusercontent.com', //94430039257-g72ffjk1auimb6g7g74i8046nld8jqn1.apps.googleusercontent.com
        clientSecret: 'WJQnKpJI0JiF9-NymqJI6msZ',
        refreshToken: '1/CsM4ORXQbm8Z4Fmpums905CCWwMV-OKC0vNH5pPAHL5nvC6J1i-QndxU26BR5bMn', //1/BBIkh1kZgIMyvaADyC71Bo09bIMt_7yAn4T9IfoZiCo
        accessToken: 'ya29.GlvxBSEcNNmVLRTFFkZHnihd5W7vB7t-doeZTfbBD--9xTzmoHZi369BjrWKHV89Y6BWWD7R_X94_wsI7RfQX8UnXhLON34afwQs9PXCQVVH-GD2P5F40VOTWHjG'  //ya29.GlsTBk_9AUK230k0kj5sXCaQMapge86cphJ4gJSnVuVBLrQtEx1fjPj8nqWUzRQMdT73GRtaVm0cDb-nJ4Ea4N3IZCTpo39U-fngvX9i1CFrm20LbIi6aadJuIgQ

    }
});

var optionsTemp = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: 'views/',
        defaultLayout: 'layout',
        partialsDir: 'views/partials/'
    },
    viewPath: 'views',
    extName: '.hbs'
};

transporter.use('compile', hbs(optionsTemp));

exports.sendOtpMail = function(data,to,cb){

    const mailOptions = {
        from: 'eduvysupervision@gmail.com', // sender address
        to: to, // list of receivers  id 15082829077-c27hlmg5rt0o821nk9l7no8763j72d0f.apps.googleusercontent.com
        subject: "Sending Otp", // Subject lin       seceret  9tuDKQHbnPZrzMkwXsaOu_zl
        template: 'otpGenerateMail',
        context: {
            cont_info:data
        }   
    };

    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            return cb(err,null);
        }

        console.log(info)

        return cb(null,info);
    })

}


exports.sendMedicine = function(data,to,cb){

    const mailOptions = {
        from: 'eduvysupervision@gmail.com', // sender address
        to: to, // list of receivers  id 15082829077-c27hlmg5rt0o821nk9l7no8763j72d0f.apps.googleusercontent.com
        subject: "Sending medicine", // Subject lin       seceret  9tuDKQHbnPZrzMkwXsaOu_zl
        template: 'medicine',
        context: {
            cont_info:data
        }   
    };

    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            return cb(err,null);
        }

        console.log(info)

        return cb(null,info);
    })

}