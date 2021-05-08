const express = require('express');
const app = express();
const morgan=require('morgan')
require('dotenv/config');

const api = process.env.API_URL
//middleware
app.use(express.json());
app.use(morgan('tiny'))

app.get(`${api}/products`,(req,res)=>{
    const product = {
        id:1,
        name:"gel",
        image:'some_url'
    }
    res.send(product)
})

app.post(`${api}/products`,(req,res)=>{
    const produit = req.body
    console.log(produit)
    res.send(produit)
})

app.listen(3001,()=>{
    console.log(api)
    console.log("Server is running on  http://localhost:3001");
})