function cancelIndividualOrder(individualOrderId,orderId){
  
  Swal.fire({
    title: "Submit your Reason for Cancellation",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Submit",
    showLoaderOnConfirm: true,
    preConfirm: async (reason) => {
      try {
       const response = await fetch('/update-individual-order-status',{
        method:"PUT",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({individualOrderId,orderId,reason})
       })
        
        if (response.ok) {
          await Swal.fire({
            title: "Good job!",
            text: "You Cancelled the Order!",
            icon: "success"
          });
          location.reload()
        }
        return response.json();
      } catch (error) {
        Swal.showValidationMessage(`
          Request failed: ${error}
        `);
      }
    },
    
  })
}