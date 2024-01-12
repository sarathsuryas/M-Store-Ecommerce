async function editAddress(id){
  var username = document.getElementById('username').value
  var mobile = document.getElementById('mobile').value
  var pincode = document.getElementById('pinCode').value
  var locality = document.getElementById('locality').value
  var address = document.getElementById('address').value
  var cdt = document.getElementById('cdt').value
  var selectState = document.getElementById('selectState').value
  var altPhone = document.getElementById('altPhone').value
try{
  Swal.fire({
    title: "Do you want to save the changes?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Save",
    denyButtonText: `Don't save`
  }).then(async(result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      const response = await fetch('/edit-address-data',{
        method:"PUT",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify({id,username,mobile,pincode,locality,address,cdt,selectState,altPhone})
    })
    if(response.ok){
      await Swal.fire("Saved!", "", "success");
      window.location.href='/user-profile'
    }


    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
    }
  });
}catch(error){
  console.error(error)
  alert('internal server error')
}
}
 

