const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
  firstname:{
    type:String,
    required:true,
    unique:true
  },
  lastname:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  phone:{
    type:Number,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
    unique:true
  }
})

const Admin = mongoose.model('admin',adminSchema)

module.exports = {Admin};