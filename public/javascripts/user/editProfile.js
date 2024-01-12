async function editProfile(username,email,phone){
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
     const response = await fetch('/edit-user-account',{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify({username,email,phone})
     })
        if(response.ok){
        await  Swal.fire("Saved!", "", "success");
         window.location.reload()
        }

    } else if (result.isDenied) {
      await  Swal.fire("Changes are not saved", "", "info");
      window.location.reload()
    }
  });
  }
  catch(error){
    console.error(error)
    alert('internal server error')
  }
}

