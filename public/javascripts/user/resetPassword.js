async function reset(){
  
  try{
const newPassword = document.getElementById('newPassword').value
const confirmPassword = document.getElementById('confirmPassword').value

const response = await fetch('/reset',{
  method:"POST",
  headers:{
    "Content-type":"application/json"
  },
  body:JSON.stringify({newPassword,confirmPassword})
})
  if(response.ok){
  await  Swal.fire({
      title: "Good job!",
      text: "Password Reset Successfully!",
      icon: "success"
    });
     window.location.href="/after-reset"
  }
  }catch(error){
    console.error(error)
    alert("internal server error")
  }
}