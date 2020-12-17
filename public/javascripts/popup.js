function success() {
  Swal.fire({
    title: "Good job!",
    text: "",
    icon: "success",
    button: "Okay",
    confirmButtonColor: '#4F4F4F'
  });
}

function fail() {
  Swal.fire({
    title: "Try Again!",
    text: "Shucks",
    icon: "error",
    button: "Okay",
    confirmButtonColor: '#4F4F4F'
  });
}

function close() {
  Swal.fire({
    title: "Close But No Cigar",
    text: "You are close to the answer.",
    icon: "info",
    button: "Okay",
    confirmButtonColor: '#4F4F4F'
  });

}