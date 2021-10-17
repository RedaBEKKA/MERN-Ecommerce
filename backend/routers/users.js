const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const crypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('name phone email');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id',async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        res.status(500).json({message:'Il nya pas cet utisateur'})
    }
    res.status(200).send(user)
})

router.post('/',async(req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:crypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        isAdmin:req.body.isAdmin
    })
    user = await user.save();
    if(!user)
    return res.status(404).send('Ladmin ne peut pas etre créé !')
    res.send(user)
})

router.post('/login',async(req,res)=>{
    const user = await User.findOne({email:req.body.email})
    const secret = process.env.secret
    if(!user){
        return res.status(400).send("L'utilisateur n'est pas trouvé")
    }
    if(user && crypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign({
            userId:user.id,
            isAdmin:user.isAdmin
        },
        secret,
        {expiresIn:'1d'}
        )
        res.status(200).send({user:user.email,token})
    }else{
        res.status(400).send("Le mot de passe est erronée")
    }
   
})

router.post('/register',async(req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:crypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        isAdmin:req.body.isAdmin
    })
    user = await user.save();
    if(!user)
    return res.status(404).send('Lutilisateur ne peut pas etre créé !')
    res.send(user)
})

router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`,async(req,res)=>{
    //le nombre de document qu'il ya dans ma collection
    const userCount = await User.countDocuments((count)=>count)
    
    if(!userCount){
        res.status(500).json({success:false})
    }
    res.send({
        count:userCount
    })    
})

module.exports =router;