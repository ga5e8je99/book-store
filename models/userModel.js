const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please write your name."],
        unique:true,
        required:true,
    },
    email:{
        type:String,
        required:[true,"please write your email address."],
        unique:true,
        validate:[validator.isEmail,"please write valid email address"]
    },
    photo:{
        type:String,
        select:false,
        default:'https://res.cloudinary.com/dk881z91k/image/upload/v1634659210/default_user_photo.png'
    },
    password:{
        type:String,
        required:[true,"please write your password"],
        minlength:8,
        select:false,
    },
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next();

    this.password = await bcrypt.hash(this.password,12)

})

userSchema.methods.correctPassword =async function(candidatepassword,userpassword){
    return await bcrypt.compare(candidatepassword,userpassword)
}

userSchema.methods.generateToken = function(id){
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE_IN
    });
}

const User = mongoose.model("User",userSchema)

module.exports = User