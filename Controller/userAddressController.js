
const Address = require('../model/addressSchema')


const addAddress = async (req, res,next) => {
  try {
    const userId = req.user.user._id
    const { username, phoneNumber, pincode, locality, address, selectedState, altPhone, city } = req.body

    let newAddress = {
      name: username, // You might want to get the user's name from your user object
      mobile: phoneNumber,
      homeAddress: address,
      pinCode: pincode,
      locality: locality,
      city: city,
      state: selectedState,
      altPhone: altPhone,
      isDefault: false,
    }
    let userAddress = await Address.findOne({ userId: userId })

    if (!userAddress) {
      newAddress.isDefault = true;
      userAddress = new Address({
        userId: userId,
        address: [newAddress]
      })
    } else {
      userAddress.address.push(newAddress)
      if (userAddress.address.length === 1) {
        userAddress.address[0].isDefault = true;
      }
    }
    await userAddress.save();
    return res.redirect('/cart/checkout')

  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}


const addAddressFromProfile = async (req, res,next) => {
  try {
    const userId = req.user.user._id
    const { username, phoneNumber, pincode, locality, address, selectedState, altPhone, city } = req.body

    let newAddress = {
      name: username, // You might want to get the user's name from your user object
      mobile: phoneNumber,
      homeAddress: address,
      pinCode: pincode,
      locality: locality,
      city: city,
      state: selectedState,
      altPhone: altPhone,
      isDefault: false,
    }
    let userAddress = await Address.findOne({ userId: userId })

    if (!userAddress) {
      newAddress.isDefault = true;
      userAddress = new Address({
        userId: userId,
        address: [newAddress]
      })
    } else {
      userAddress.address.push(newAddress)
      if (userAddress.address.length === 1) {
        userAddress.address[0].isDefault = true;
      }
    }
    await userAddress.save();
    return res.redirect('/user-profile')

  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}

const editAddress = async (req,res,next)=>{
  try{
    const userId = req.user.user._id
    const addressId = req.params.id;
    const address = await Address.findOne({userId:userId})
    const result = address.address.filter((item)=> addressId===item._id.toString())
    
    return res.render('USER/editAddress',{addressData:result[0]})
  
  }catch (err) {
    next(err); // Pass the error to the next middleware
    }
    
  }

  const editAddressData = async (req,res,next) =>{
    try{
      const userId = req.user.user._id
      const addressId = req.params.id
    const {username,mobile,pincode,locality,address,cdt,selectState,altPhone} = req.body
    console.log(req.body)
     const adrs = await Address.findOne({userId:userId})
    const indexToUpdate = adrs.address.findIndex((item)=>addressId===item._id.toString() )
  
    if (indexToUpdate !== -1) {
      // Create the updated address object
      const updatedAddress = {
        name: username,
        mobile: mobile,
        homeAddress: address,
        pinCode: pincode,
        locality: locality,
        city: cdt,
        state: selectState,
        altPhone: altPhone,
        isDefault: false,
      };
    
  
    // Update the address in the array
    adrs.address[indexToUpdate] = updatedAddress;
    await adrs.save()
    return res.redirect('/user-profile')
    }else {
      // Handle the case where the address with the given id was not found
      return res.status(404).send('Address not found');
    }
  
  
    }catch (err) {
      next(err); // Pass the error to the next middleware
    }
  }

  module.exports = { addAddress,addAddressFromProfile,editAddress,editAddressData}