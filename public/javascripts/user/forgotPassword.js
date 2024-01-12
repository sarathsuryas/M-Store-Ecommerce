async function forgotPassword(mail){
      let email = mail

    try{
     if(!email){
     await Swal.fire({
     
        title: "Submit Your Email Address",
        input: "email",
        inputAttributes: {
          autocapitalize: "off"
        },
      
        showCancelButton: true,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: async (email) => {
          try {
            
            const response = await fetch('/forgot-password',{
              method:"POST",
              headers:{
                "Content-Type":"application/json"
              },
              body:JSON.stringify({email})
            })
            if (response.ok) {
              Swal.fire({
                title: "Good job!",
                text: "Mail Sent!",
                icon: "success"
              });
            }else{
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Email Not found!',
                
              })
            }
          } catch (error) {
            Swal.showValidationMessage(`
              Request failed: ${error}
            `);
          }
        },
        
      })

    }else{
      const response = await fetch('/forgot-password',{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({email})
      })
      if (response.ok) {
        Swal.fire({
          title: "Good job!",
          text: "Mail Sent!",
          icon: "success"
        });
      }else{
        alert('email not found')
      }
    }

  }
    catch(error){
      console.error(error)
      return alert('internal server error')
    }
}