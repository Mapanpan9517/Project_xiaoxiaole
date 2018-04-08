var express = require("express");
var fs = require("fs");
var path = require("path");
var formidable = require("formidable");
var app = express();
var dburl = path.resolve(__dirname,"./fakedb.txt");
app.use(express.static("view"));
//列出所有接口
app.get("/xianshi",function(req,res){
    fs.readFile(dburl,function(err,content){
        var contentobj = JSON.parse(content.toString());
        res.json({"result":contentobj});
    })
});
app.post("/xianshi",function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,content){
        fs.readFile(dburl,function(err,data){
            var dataobj = JSON.parse(data.toString());
            dataobj.push({
                "fenshu":content.fenshu
            });
            fs.writeFile(dburl,JSON.stringify(dataobj),function(){
                res.json({"result":1});
            })
        })
    })
});
app.delete("/xianshi",function(req,res){
    fs.readFile(dburl,function(err,content){
        var contentobj = JSON.parse(content.toString());
        contentobj.splice(0,contentobj.length);
        fs.writeFile(dburl,JSON.stringify(contentobj),function(){
            res.json({"result":1});
        })
    })
})
app.listen(3000);