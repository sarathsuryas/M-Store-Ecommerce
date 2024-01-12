async function couponStatus(couponId){
  try {
   const response = await fetch('/admin/coupon-status-update',{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({couponId})
   })
   if(!response.ok){
     alert('error')
   }
    location.reload()
  } catch (error) {
    console.log(error)
    alert('internal server error')
  }
}