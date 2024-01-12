
let addressId
let payment
function addressFunction(value){
  addressId=value
  //alert(addressId)
}

function paymentType(value){
  payment = value
  //alert(payment)
}


async function placeOrder(couponCode,totalShipment){
  
  var discountPrice = document.getElementById('totalShipment').innerText
  localStorage.removeItem("discount");
  if(!addressId||!payment){
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Plese Select a Payment option and Address!",
      footer: '<a href="#">Why do I have this issue?</a>'
    })
    return;
  }


try{
  if(payment==="cod"){
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Confirm !"
  }).then(async(result) => {
    if (result.isConfirmed) {
     
    const response = await fetch('/place-order-cod',{
         method:"POST",
         headers:{
          'content-type':'application/json'
         },
         body:JSON.stringify({payment,addressId,discountPrice,couponCode,totalShipment})
    })

   
      
    if(response.status===205){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "One of the product is out of stock!",
        footer: '<a href="#">Why do I have this issue?</a>'
      });
    return
    }

   
    if(response.ok){
    Swal.fire({
     title: "Sucess!",
     text: "Your Order Placed Successfully.",
    icon: "success"
    }).then((data)=>{
      
      window.location.href = '/order-confirmed';
    })
       }
       else {
      
        await Swal.fire({
          title: "Error!",
          text: "There was an error placing your order.",
          icon: "error"
        });
      }
    
    }
  });
}
if (payment === "online-payment") {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Confirm!"
  }).then(async (result) => {
    alert(discountPrice)
    if (result.isConfirmed) {
      const response = await fetch('/place-order-online-payment', {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ payment, addressId, discountPrice,couponCode,totalShipment})
      });

      if(response.status===205){
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "One of the product Is out of stock!",
          footer: '<a href="#">Why do I have this issue?</a>'
        });
      }

      if (response.ok) {
        const data = await response.json();
        const order = data.razorOrder;
        var orderId = order.id;
        const amount = order.amount;
        const key_id= data.key_id
        const secret_key = data.secret_key
        var options = {
          "key": "rzp_test_DsOFlMd1X8uuKq",
          "amount": amount,
          "currency": "INR",
          "name": "Acme Corp",
          "description": "Test Transaction",
          "image": "https://example.com/your_logo",
          "order_id": orderId,
          handler: function (response) {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Payment successful",
              showConfirmButton: false,
              timer: 1500,
            });
            
            window.location.href = `/paymentStatus?orderId=${orderId}&status=success&couponCode=${couponCode}`
          },
          prefill: {
            name: "Gaurav Kumar",
            email: "gaurav.kumar@example.com",
            contact: "9000090000"
          },
          notes: {
            address: "Razorpay Corporate Office"
          },
          theme: {
            color: "#3399cc"
          }
          // ... rest of your options
        };

        var rzp1 = new Razorpay(options);
        
        
          rzp1.on("payment.failed", async function (response) {
            await  Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Payment failed!",
              footer: '<a href="#">Why do I have this issue?</a>',
            });
            window.location.href = `/paymentStatus?orderId=${orderId}&status=Failed`;
          });
        

        rzp1.open();
      } else {
        await Swal.fire({
          title: "Error!",
          text: "There was an error placing your order.",
          icon: "error"
        });
      }
    }
  });
}
if(payment==='wallet'){
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Confirm !"
  }).then(async(result) => {
    if (result.isConfirmed) {
     
    const response = await fetch('/place-order-wallet',{
         method:"POST",
         headers:{
          'content-type':'application/json'
         },
         body:JSON.stringify({payment,addressId,discountPrice,couponCode,totalShipment})
    })
     if(response.status===201){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Wallet empty!",
        footer: '<a href="#">Why do I have this issue?</a>'
      });
      return
     }

     if(response.status===202){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Wallet Has no Sufficient Balance!",
        footer: '<a href="#">Why do I have this issue?</a>'
      });
      return
     }
     if(response.status===205){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "one of the item is out of stock!",
        footer: '<a href="#">Why do I have this issue?</a>'
      });
      return
     }
   
    if(response.ok){
    Swal.fire({
     title: "Sucess!",
     text: "Your Order Placed Successfully.",
    icon: "success"
    }).then((data)=>{
      
      window.location.href = '/order-confirmed';
    })
       }
       else {
      
        await Swal.fire({
          title: "Error!",
          text: "There was an error placing your order.",
          icon: "error"
        });
      }
    }
  });


}
}catch(error){
  console.error('Error:', error);
  await Swal.fire({
    title: "Error!",
    text: "An unexpected error occurred.",
    icon: "error"
  });
}
}

// async function verifyPayment(razorpayPaymentId, razorpayOrderId, razorpaySignature) {
//   alert(razorpayPaymentId, razorpayOrderId, razorpaySignature)
//   try {
//     const response = await fetch('/verify-razorpay-payment', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         razorpay_payment_id: razorpayPaymentId,
//         razorpay_order_id: razorpayOrderId,
//         razorpay_signature: razorpaySignature,
//       }),
//     });

//     if (response.ok) {
//       const result = await response.json();
//       if (result.success) {
//         // Payment verification succeeded
//         Swal.fire({
//           title: 'Payment Verified',
//           text: 'Your payment has been successfully verified.',
//           icon: 'success',
//         });
//         // Perform any additional actions after successful payment verification
//       } else {
//         // Payment verification failed
//         Swal.fire({
//           title: 'Payment Verification Failed',
//           text: 'There was an issue verifying your payment.',
//           icon: 'error',
//         });
//       }
//     } else {
//       // Handle HTTP error
//       console.error('HTTP Error:', response.statusText);
//       Swal.fire({
//         title: 'Error',
//         text: 'An unexpected error occurred while verifying payment.',
//         icon: 'error',
//       });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     Swal.fire({
//       title: 'Error',
//       text: 'An unexpected error occurred while verifying payment.',
//       icon: 'error',
//     });
//   }
// }



