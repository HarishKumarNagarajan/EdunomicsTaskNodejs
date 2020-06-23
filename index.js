const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const port = process.env.PORT || 1234;
const fs = require('fs')

app.use(bodyParser.urlencoded({
    extended:false
}));
app.use(bodyParser.json());

app.use(cors());

var total=[];

function getBounces(heightM, coefficient) {
    var distance = heightM; // avoid reading input twice
    var bounce = 0;
    total= [];
    while (heightM >= 0.10) { // just compare with meters...
      bounce = bounce + 1;
      heightM = heightM * coefficient;
      distance = distance + heightM * 2;
      total.push({
        bounceno: bounce,
        nextBounceH: 0,
        co_ordinate: distance/2
      })
      total.push({ 
          bounceno: bounce,
          nextBounceH: heightM,
          co_ordinate: distance
        });
    //   if (bounce > 100) throw "error";
    }
    return [bounce, distance];
}

app.get("/bounces",(req,res)=>{
    if (!req.query.height || !req.query.coefficient){
        return res.status(400).send({
            msg: "Please provide proper details"
        })
    }
    height = req.query.height;
    coefficient = req.query.coefficient;
    if (coefficient >= 1 || coefficient < 0) {
        return res.status(400).send({
            msg: "Please provide proper coefficient value"
        });
      }
      var result = getBounces(+height, +coefficient);
    //   console.log(total);
      var json ={
        GraphDetails: total,
        totalbounce: result[0],
        distance: result[1]
    };
    fs.readFile('test-results.json',function(err,content){
        if(err) throw err;
        var parseJson = JSON.parse(content);
        parseJson.push(json);
        fs.writeFile('test-results.json',JSON.stringify(parseJson),function(err){
          if(err) throw err;
        });
    });
      return res.status(200).send(json);
});

app.get('/pastresult',(req,res)=> {
    let get = fs.readFileSync('test-results.json');
    let past = JSON.parse(get);
    return res.status(200).send({
        pastResult:past
    });
});

app.get('/',(res)=>{
    res.send("\t\t\tWelcome\n\n -> /pastresult to view jsonobject of past readings\n\n-> /bounces?height=3&coefficient=0.39 to get curretn result chnage the height and coeeficient")
})


app.listen(1234, ()=>{
    console.log("Started at http://localhost:"+port);
})