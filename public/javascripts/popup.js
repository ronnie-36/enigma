function success() {
  Swal.fire({
    title: "Good job!",
    text: "",
    icon: "success",
    confirmButtonColor: '#4F4F4F',
    allowOutsideClick: false
  }).then((result) => {
    if (result.isConfirmed) {
      location.reload();
    } 
  })
}

function fail() {
  Swal.fire({
    title: "Try Again!",
    text: "Shucks",
    icon: "error",
    confirmButtonColor: '#4F4F4F'
  });
}

function close() {
  Swal.fire({
    title: "Close, But No Cigar",
    text: "You are close to the answer.",
    icon: "info",
    confirmButtonColor: '#4F4F4F'
  });

}