const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({path:'orderItems',populate:{path:'product',populate:'category'}})

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

router.post('/',async(req,res)=>{
    const OrderItemIds =Promise.all( req.body.orderItems.map(async order=>{
        let newOrder = new OrderItem({
            quantity:order.quantity,
            product:order.product
        })
        newOrder = await newOrder.save()
        return newOrder._id
    }))
    const orderItemIdResolve = await OrderItemIds

    const totalPrices = await Promise.all(orderItemIdResolve.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))
    const prixTotal = totalPrices.reduce((a,b)=>a+b,0)
    let commande = new Order({
        orderItems:orderItemIdResolve,
        shippingAdress1:req.body.shippingAdress1,
        shippingAdress2:req.body.shippingAdress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:prixTotal,
        user:req.body.user
    })
    commande = await commande.save();
    if(!commande)
    return res.status(404).send('La commande ne peut pas étre ajouté !')
    res.send(commande)
})

router.put('/:id',async(req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status:req.body.status
        },
        {new:true}
        );
        if (!order) {
            res.status(500).json({message:'Il nya pas cette commande'})
        }
        res.status(200).send(order)
})

router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'La commande a été supprimé !'})
        } else {
            return res.status(404).json({success: false , message: "La commande n'a pas été trouvé!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/get/totalSales',async(req,res)=>{
    const totalSales = await Order.aggregate([
        {$group:{_id:null,totalSales :{$sum:'$totalPrice'}}}
    ])
    if(!totalSales){
        res.status(400).send('Le prix de la commande ne peut pas étre généré')
    }
    res.send({totalSales:totalSales.pop().totalSales})
})

router.get(`/get/count`,async(req,res)=>{
    
    //le nombre de document qu'il ya dans ma collection
    const orderCount = await Order.countDocuments((count)=>count)
    
    if(!orderCount){
        res.status(500).json({success:false})
    }
    res.send({
        count:orderCount
    })    
})

router.get(`/get/userorders/:id`, async (req, res) =>{
    const userOrderList = await Order.find({user:req.params.id})
    .populate({path:'orderItems',populate:{path:'product',populate:'category'}}).sort({'dateOrdered':-1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

module.exports =router;