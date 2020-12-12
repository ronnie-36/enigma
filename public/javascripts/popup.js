function success()
{
    Swal.fire({
        title: "Good job!",
        text: "",
        icon: "success",
        button: "Okay",
        confirmButtonColor: '#4F4F4F'
      });
}
function fail()
{
    Swal.fire({
        title: "Try Again!",
        text: "Shucks",
        icon: "error",
        button: "Okay",
        confirmButtonColor: '#4F4F4F'
      });   
}