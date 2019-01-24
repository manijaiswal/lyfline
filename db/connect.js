
const mongoose          =   require('mongoose');
const configs           =   require('../utility/configs');
const log4jsLogger      =   require('../loggers/log4js_module');

var logger              =   log4jsLogger.getLogger('DataBase');

//mongodb://<dbuser>:<dbpassword>@ds137812.mlab.com:37812/flight-server   mongodb://flight:Nitp123@ds137812.mlab.com:37812/flight-server
//'mongodb://localhost:27017/'+configs.DB_NAME

//mongodb://<dbuser>:<dbpassword>@ds139645.mlab.com:39645/vizack
mongoose.connect('mongodb://localhost:27017/'+configs.DB_NAME,{useNewUrlParser: true },(err)=>{
    if(err){
        logger.error({"r":"mongodb","msg":"mongodb_connection_error","body":err});
        return;
    }
    logger.info({"r":"mongodb","msg":"Database_successfully_connected","body":"success"});
});