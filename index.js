const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config()

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const password = process.env.PASSWORD;
mongoose.connect('mongodb+srv://ShortUrl:'+password+'@cluster0.paclidl.mongodb.net/')

const MapSchema = new mongoose.Schema({
    longURL:{
        type:  String,
        require: true
    },
    shortURL:{
        type:  String,
        require: true
    }
});
const HashMap = new mongoose.model("HashMap",MapSchema);

const md5 = require('md5');

function generateUniqueCode(url) {
  const hash = md5(url);
  const decimalNumber = parseInt(hash, 16);
  const base62Characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  let number = decimalNumber;
  while (number > 0) {
    const remainder = number % 62;
    code = base62Characters[remainder] + code;
    number = Math.floor(number/62);
  }
  while (code.length < 7) {
    code = '0' + code;
  }
  return code;
}

let comURL;
app.get("/",(req,res) => {
    comURL = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.render("index",{message :"",icon:""});
})

app.post("/",async (req,res) => {
    const url = req.body.longURL;
    if(url.length == 0){
        res.render("index",{message :"",icon:""});
    }
    let code = await generateUniqueCode(url);
    let short = code.substring(0,7);
    HashMap.findOne({shortURL:short}).then((data) =>{
        if(data){
            if(data.longURL === url){
                var fullUrl =  comURL + short;
                res.render("index",{message : fullUrl,icon: 'content_copy'});
            }
            else{
                let k =  Math.floor(Math.random()*code.length) - 8;
                short = code.substring(k,7);
                const data = new HashMap({
                    longURL : url,
                    shortURL : short
                })
                HashMap.create(data);
                var fullUrl =  comURL + short;
                res.render("index",{message : fullUrl,icon: 'content_copy'});
            }
        }else{
            const data = new HashMap({
                longURL : url,
                shortURL : short
            })
            HashMap.create(data);
            var fullUrl =  comURL + short;
            res.render("index",{message : fullUrl,icon: 'content_copy'});
        }
    }).catch((err)=> {
        return res.status(500).send("Sorry, There is a server issue");
    });
})

app.get("/:uqcode", async (req,res) => {
    HashMap.findOne({shortURL:req.params.uqcode}).then((data) =>{
        if(data){
            res.redirect(data.longURL);
        }else{
            return res.status(404).send("There is no such object exists in the database");
        }
    }).catch((err)=> {
        return res.status(500).send("Sorry, There is a server issue");
    });
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
app.listen(port,function(){
    console.log("Server started");
});