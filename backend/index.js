const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose')

const app = express()
const PORT = 6000

app.use(bodyParser.json());
app.use(cors());

const Parser = require('./modules/Parser')

app.post('/parsePage',async (req,res)=>{
    console.log(req.body)
    let urlRaw = req.body.url
    await Parser.analysePage(urlRaw)

    res.send({status:'OK'})
})

const start = async ()=>{

    await mongoose.connect(`mongodb://root:pass12345@mongodb:27017/parserdb?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`, {useNewUrlParser: true, useUnifiedTopology: true});

    app.listen(PORT,()=>{console.log(`[server]: Server is running at http://localhost:${PORT}`)});


}
start()