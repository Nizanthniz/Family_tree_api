const express = require('express');
const bodyParser = require('body-parser');
var path = require('path'); 
const cookieparser = require("cookie-parser");

const cors = require("cors");
var conn = require('./config/db');
var fs=require('fs')
const fileUpload = require('express-fileupload');
var dir = path.join(__dirname, 'images');
var sendpushnotification = require('./modules/users/push_notification/notification_fcm');
const moment = require('moment');
let cron = require('node-cron');

const DateTime = require('node-datetime/src/datetime');
// var corsOptions = {
//     origin: ["*",],
//     methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
//   };
var api_prefix='/api/v1'

const app = express();

app.use(express.json()); 
app.use(express.static('public')); 
app.use('/public', express.static('public'));
app.use(cookieparser());
//app.use(fileUpload());
app.use(fileUpload({
    createParentPath: true
  }));
app.use('/images', express.static(dir));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// app.use('/', routes);


const listener = app.listen(process.env.PORT || 12000, '0.0.0.0',() => {
    console.log('Your app is listening on port ' + listener.address().port)
})

conn.connect((err)=>{
    if(err)
    console.log('Database connection Error :'+err);
    else
    console.log('db connect')
});

app.use(api_prefix+'/users',require('./modules/users/users.routes'));
app.use(api_prefix+'/post',require('./modules/post/post.routes'));
app.use(api_prefix+'/group',require('./modules/group/group.routes'));

// function parallel(middlewares) {
//     return function (req, res, next) {
//       async.each(middlewares, function (mw, cb) {
//         mw(req, res, cb);
//       }, next);
//     };
//   }

//   app.use(parallel([
//     api_prefix+'/users',require('./modules/users/users.routes'),
//     api_prefix+'/post',require('./modules/post/post.routes'),
//     api_prefix+'/group',require('./modules/group/group.routes')
   
//   ]));


// cron.schedule('20 22 * * *', async () => { /// one weekly repition
// cron.schedule('*/1 * * * *', async () => {
        
          
//        // const now = new DateTime().format('YYYY-mm-dd');
//         // var sl = "select fcm_token from users where id=?";
//         // conn.query(sl,[72],async function (err, repition) {
//         //     if (err) {
//         //         console.log("error");
//         //     } else if (repition.length>0) {
//         //         console.log(repition[0].fcm_token);
         
    
         
//             await sendpushnotification.sendInviteAcceptSignupMembernotification('98')
      
    
//             }
            
//         );
    // });



 module.exports = app;


 