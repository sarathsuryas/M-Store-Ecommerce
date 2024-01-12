document.addEventListener('DOMContentLoaded',function (){
  const deleteButtons = document.querySelectorAll('.delete-image');

  deleteButtons.forEach(button =>{
    button.addEventListener('click',function () {
      const index = this.getAttribute('data-index')
       deleteImage(index)
    })
  })
})

async function deleteImage(index){
  try {
    const productId = document.getElementById('PRODUCTID').value
   
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async(result) => {
      if (result.isConfirmed) {
        const response = await fetch('/admin/delete-image',{
          method:"PUT",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify({index,productId})
        })
         if(response.ok){
          await  Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
          location.reload()
         }else{
          alert('fetch error')
         }
      }
    });
    
  } catch (error) {
    console.error(error)
    alert('internal server error')
  }
}
