const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
  },
  mobile:{
   type:Number,
   required:true
  },
  email:{
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true,
  },
  token:{
     type:String
  },
  tokenExpire:{
     type:String
  },
  isAdmin:{
    type:Boolean,
    default:false,
  },
  isBlocked:{
    type:Boolean,
    default:false
  }
})




const User= mongoose.model('users',userSchema)

module.exports = {User}