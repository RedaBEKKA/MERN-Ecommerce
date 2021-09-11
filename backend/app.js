const express = require('express');
const app = express();
const morgan=require('morgan')
const mongoose = require("mongoose");

const cors = require('cors')
require('dotenv/config');

const api = process.env.API_URL
app.use(cors());
app.options('*',cors())

//middleware
app.use(express.json());
app.use(morgan('tiny'));

const productRouter = require('./routers/product')
const usersRoutes = require("./routers/users");
const ordersRoutes = require("./routers/orders");
const categoriesRoutes = require("./routers/categories");


//Router
app.use(`${api}/products`,productRouter)
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/categories`, categoriesRoutes);



//api

mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology: true
    //dbName:'eshop...'
})
.then(()=>{
    console.log("DATABASE connection is ready !!")
})
.catch(e=>console.log(e))

app.listen(3001,()=>{
    console.log(api)
    console.log("Server is running on  http://localhost:3001");
})