const express = require('express');
const { Category } = require('../models/category');
const {Product}=require('../models/product')
const router = express.Router()
const mongoose = require('mongoose');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
  
  const upload = multer({ storage: storage })

router.get(`/`,async(req,res)=>{
       let filter = {}
      if(req.query.categorie){
       filter = {category:req.query.categorie.split(',')}
    }
    const product = await Product.find(filter).populate('category')
    //const product = await Product.find()
    //const product = await Product.find().select('name image -_id')
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)    
})

router.get(`/:id`,async(req,res)=>{
   //to display a product using not ID
    const product = await Product.findById(req.params.id).populate('category')//it should be an ID 
    
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)    
})


router.post(`/`,upload.single('images'),async(req,res)=>{
    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).send('Invalide categorie')
    }
    const file = req.file;
    if (!file) return res.status(400).send('Pas dimages');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    console.log(basePath+"chemin")
    let produit = new Product({
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    })
    
        produit = await produit.save()
        if (produit){
            
            return res.send(produit);
    
        } else{
            return res.status(500).send('Le produit ne peut pas étre créé')
         }
   
    // produit.save()
    //         .then((createdProduct)=>{
    //             res.status(201).json(createdProduct)
    //         })
    //         .catch(err=>res.status(500).json({
    //             error:err,
    //             success:false
    //         }))
    
})

router.put('/:id',async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalide categorie')
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description:req.body.description,
            richDescription:req.body.richDescription,
            image:req.body.image,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            numReviews:req.body.numReviews,
            isFeatured:req.body.isFeatured
        },
        {new:true} //pour afficher le nouveau field
        );
        if (!product) {
            res.status(500).json({message:'Le produit ne peut pas étre modifié'})
        }
        res.status(200).send(product)
})


router.delete('/:id',(req,res)=>{
    Product.findByIdAndRemove(req.params.id)
            .then(product=>{
                if (product) {
                    res.status(200).json({success:true,message:"le prdouit  a ete supp"})
                }else{
                    return res.status(404).json({success:false,message:'la catégorie n\'existe pas'})
                }
            })
            .catch(err=>{
                res.status(400).json({success:false,message:'erreur'})
            })
})


router.get(`/get/count`,async(req,res)=>{
    
    //le nombre de document qu'il ya dans ma collection
    const productCount = await Product.countDocuments((count)=>count)
    
    if(!productCount){
        res.status(500).json({success:false})
    }
    res.send({
        count:productCount
    })    
})

//Avoir uniquement les produit featured:
router.get(`/get/featured/:count`,async(req,res)=>{
    const count=req.params.count ? req.params.count :0
    const productFeatured = await Product.find({isFeatured:true}).limit(Number(count))   
    if(!productFeatured){
        res.status(500).json({success:false})
    }
     res.send(productFeatured)   
})

module.exports=router;