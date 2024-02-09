async function applyCoupon(){
 const removeButton = document.getElementById('applyButton').innerHTML
 if(removeButton==="Remove Coupon"){
  return location.reload()
 }
 var cartTotalValue = document.getElementById('cartTotal').innerText;
 cartTotalValue = cartTotalValue.replace('₹ ', '').trim();
 

 var numericCartTotal = parseFloat(cartTotalValue);
  var totalShipment = document.getElementById('totalShipment').innerText;
  totalShipment = totalShipment.replace('₹ ', '').trim();
  var numericShipment = parseFloat(totalShipment);
  var couponCode = document.getElementById('couponCode').value.trim()
 
 const response = await fetch('/apply-coupon',{
  method:"POST",
  headers:{
    "Content-type":"application/json"
  },
  body:JSON.stringify({couponCode,cartTotalValue})

 })

 if(response.status===201){
 await Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "You alredy redeemed the Coupon!",
    footer: '<a href="#">Why do I have this issue?</a>'
  });
 return location.reload()
 }
 if(response.status===202){
   await Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Coupon Reached The limit!",
    footer: '<a href="#">Why do I have this issue?</a>'
  });
  location.reload()
 }
  if(response.status===203){
    const data = await response.json()

    var discountValue = data.discountAmtOrPercentage
    
     var discount = document.getElementById('discount').innerText = discountValue
      discount = document.getElementById('discount').innerText;
     var numericDiscount = parseFloat(discount)
     const sum = numericCartTotal-numericDiscount
     document.getElementById('cartTotal').innerText = sum
     const result = totalShipment-numericDiscount
     document.getElementById('totalShipment').innerText = result
     
      localStorage.setItem("discount", numericDiscount);
      
      document.getElementById('applyButton').innerHTML="Remove Coupon"
      document.getElementById('viewCoupon').style.display = 'none';
  
          document.getElementById('discount').innerText = data.discountAmtOrPercentage
       return 
  }



  if(response.ok){
    const data = await response.json()

    var discountValue = data.maxRedeemableAmtOrPercentage
    
     var discount = document.getElementById('discount').innerText = discountValue
      discount = document.getElementById('discount').innerText;
     var numericDiscount = parseFloat(discount)
     const sum = numericCartTotal-numericDiscount
     document.getElementById('cartTotal').innerText = sum
     const result = totalShipment-numericDiscount
     document.getElementById('totalShipment').innerText = result
     
      localStorage.setItem("discount", numericDiscount);
      
      document.getElementById('applyButton').innerHTML="Remove Coupon"
      document.getElementById('viewCoupon').style.display = 'none';
      if(data.percentage==="percentage"){
        document.getElementById('discount').innerText = data.discountAmtOrPercentage + " %"
        }else{
          document.getElementById('discount').innerText = data.discountAmtOrPercentage
        }
// Get a value from localStorage
       
  }if(!response.ok){
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Coupon not Found!",
    footer: '<a href="#">Why do I have this issue?</a>'
  });
  
}
}