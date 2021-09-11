const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    street:{
        type:String,
        default:''
    },
    apartment:{
        type:String,
        default:''
    },
    city:{
        type:String,
        dafault:''
    },
    zip:{
        type:String,
        dafault:''
    },
    country:{
        type:String,
        dafault:''
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

productSchema.virtual('id').get(function(){
    return this._id.toHexString()
})

productSchema.set('toJSON',{
    virtuals:true
})

exports.User = mongoose.model('User', userSchema);
