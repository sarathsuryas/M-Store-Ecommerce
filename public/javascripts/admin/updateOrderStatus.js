
function getStatus(orderId){
  var selectedStatus = document.getElementById('selectedStatus').value;
   
   Swal.fire({
    title: "Do you want to save the changes?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Save",
    denyButtonText: `Don't save`
  })
  .then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      statusUpdate(orderId,selectedStatus)
     
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
    }
  });
}

async function statusUpdate(Id,status){
  
  const orderId = Id
  const selectedStatus = status
  try{
  const response = await fetch('/admin/update-order-status',{
      method:'PUT',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({orderId,selectedStatus})
  })
  if(response.ok){
    Swal.fire("Saved!", "", "success");
    location.reload()
  }
}catch(error){
  console.error(error)
  return res.status(500).json({error:'internal server error'})
}
}

