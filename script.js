var express = require('express'),
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
app.use(function(error,req,res,next){
    if (error instanceof SyntaxError){
        res.status(400).json({"error":"Could not decode request: JSON parsing failed"});
    }else{
        next();
    }
});

app.all('/',upload.single('file'),function(req,res,next){
    var send = {"error":"Could not decode request: JSON parsing failed"};
    var errJSON = {"error":"Could not decode request: JSON parsing failed"};
    var data = {};
    if(typeof req.file != "undefined"){
        fs.exists(req.file.path,function(exists){
            fs.readFile(req.file.path,'utf8',function(err,readFile){
                if (err) res.status(400).type('application/json').json(send);
                jsonParser(readFile,res,req,errJSON);
                fs.unlink(req.file.path,function(err){
                    if(err) throw err;
                    console.log("removed the temp json file");
                });
            });
        });
    }else if(typeof req.body != 'undefined'){
        jsonParser(req.body,res,req,errJSON);
    }else{
        res.status(400).type('application/json').json(send);
    }
});

function jsonParser(json,res,req,errJSON){
    try{
        console.log('json');
        json = (typeof json == 'string')? JSON.parse(json):json;
        if(typeof json.payload != 'undefined'){
            var mustkey = ["image","slug","title"];
            var response = [];
            var i =0;
            for(item in json.payload){
                var pick = _.pick(json.payload[item],mustkey);
                var cur = response.length;
                if(Object.keys(pick).length>0 && json.payload[i].drm == true && json.payload[i].episodeCount>0){
                    response[cur] = pick;
                    if(typeof response[cur].image!="undefined"  && typeof response[cur].image.showImage!="undefined"){
                        response[cur].image = response[cur].image.showImage;
                    }
                }
                i++;
            }
            res.json({response:response});
        }else{
            res.status(400).type('application/json').json(errJSON);
        }
    }catch(e){
        res.json(errJSON);
    }
}
var server = app.listen(9002, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('mi9 app listening at http://%s:%s', host, port);
});

