const express = require('express');
const app = express();
const morgan=require('morgan')
const mongoose = require("mongoose");
const authJwt = require('./helpers/jwt');
const cors = require('cors');
require('dotenv/config');

const api = process.env.API_URL
app.use(cors());
app.options('*',cors())

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(function errorHanlding(err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Utilisateur nest pas autorisé'
        });
    };
 
    if(err.name === 'ValidationError'){
        return res.status(401).json({message: err});
    }
 
    return res.status(500).json(err);
});

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