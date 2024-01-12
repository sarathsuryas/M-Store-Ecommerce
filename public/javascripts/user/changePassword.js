


async function updatePassword(oldPassword,newPassword){
   const response = await fetch('/change-password',{
    method:"put",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({oldPassword,newPassword})
   })
     if(response.status===201){
       document.getElementById('error').textContent="Invalid Password"
     }
     else if(response.status===200){
     await  Swal.fire({
        title: "Good job!",
        text: "Password Changed!",
        icon: "success"
      });
      window.location.reload()
     }
}
