const express = require('express');
const app = express();
const port = 5000;
const fs = require("fs")
const multer = require("multer")
var cors = require('cors')


app.use(cors())
app.use(express.json())

app.use(express.static('uploads'))

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'uploads/')
    },
    filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
})

const upload = multer({ storage })

app.get('/data',(req,res)=> {
  fs.readFile('./data.json','utf-8',(err,data)=>{
    res.json(JSON.parse(data))
  })
})

app.post('/api/data', (req, res) => {
  const newData = req.body.data;

  console.log('Received data:', newData);
  fs.readFile('./data.json','utf-8',(err,data)=>{
    let tempData = JSON.parse(data)
    tempData.data.push(newData)
    fs.writeFile("./data.json",JSON.stringify(tempData),(err)=>{})
  })
  res.sendStatus(200);
});

app.all('/login', (req,res) => {
  const response={result: ""}
  fs.readFile('./users.json','utf-8',(err,data)=> {
    let tempData=JSON.parse(data)
    let flag=0
    tempData.forEach(element => {
      if(req.query.email in element){
        if(req.query.pass===element[req.query.email].password){
          flag=1
        }
        else {
          flag=2
        }
      }
    });
    if (flag===1) {
      response.result="success"
    }
    else if (flag===2) {
      response.result="pass"
    }
    else {
      response.result="email"
    }
    res.json(response)
  })
})

app.get("/delete", (req,res) => {
  let index=req.query.index
  fs.readFile('./data.json','utf-8',(err,data)=>{
    let tempData = JSON.parse(data)
    tempData.data.splice(index,1)
    tempData.uploads.splice(index,1)
    fs.writeFile("./data.json",JSON.stringify(tempData),(err)=>{})
    res.json({})
  })
})

app.post('/signup', (req,res) => {
  const info = req.body.info
  console.log(info)
  fs.readFile('./users.json','utf-8',(err,data)=> {
    let tempData = JSON.parse(data)
    tempData.push(info)
    fs.writeFile("./users.json",JSON.stringify(tempData),err=>{})
  })
  res.sendStatus(200)
})

app.post('/api/upload', upload.single('image'),(req,res)=>{
    console.log("uploaded file", req.file)
    try {
        fs.readFile('./data.json','utf-8',(err,data)=>{
            let tempData = JSON.parse(data)
            tempData.uploads.push(req.file.filename+"."+req.file.mimetype.substring(req.file.mimetype.indexOf('/')+1))
            fs.writeFile("./data.json",JSON.stringify(tempData),(err)=>{})
            fs.rename("./uploads/"+req.file.filename,"./uploads/"+req.file.filename+"."+req.file.mimetype.substring(req.file.mimetype.indexOf('/')+1),()=>{})
    })}
    catch(err){
        console.log(err)
    }
    res.sendStatus(200)
}) 

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});