var m2 = require('m2njs'),
    express = require('express'),
    _ = require('lodash'),
    multer = require('multer'),
    bodyParser = require('body-parser'),
    upload = multer({dest:'uploads/'}),
    fs = require('fs'),
    util = require('util');
var app = express();
/**/
app.set('view engine','jade');
app.use(bodyParser.json());



app.get('/',function(req,res){
    res.render('index',{pageTitle:'Welcome mi9'});
});

app.post('/',upload.single('file'),function(req,res,next){
    var send = {"error": "Something happened that I could not handle properly"};
    var errJSON = {"error":"Could not decode request: JSON parsing failed"};
    var data = {};
    if(typeof req.file != "undefined"){
        console.log("file");
        fs.exists(req.file.path,function(exists){
            fs.readFile(req.file.path,'utf8',function(err,readFile){
                if (err) res.json(send);
                jsonParser(readFile,res,req,errJSON);
                fs.unlink(req.file.path,function(err){
                    if(err) throw err;
                    console.log("removed the temp json file");
                });
            });
        });
    }else if(typeof req.body != 'undefined'){
        console.log(req.body);
        jsonParser(req.body,res,req,errJSON);
    }else{
        res.json(send);
    }
});

function jsonParser(json,res,req,errJSON){
    try{

        json = (typeof json == 'string')? JSON.parse(json):json;
        var mustkey = ["image","slug","title"];
        var response = [];
        for(item in json.payload){
            i = response.length;
            response[i] = _.pick(json.payload[item],mustkey);
            if(typeof response[i].image!="undefined"  && typeof response[i].image.showImage!="undefined"){
                response[i].image = response[i].image.showImage;
            }
        }
        res.json({response:response});
    }catch(e){
        res.json(errJSON);
    }
}


