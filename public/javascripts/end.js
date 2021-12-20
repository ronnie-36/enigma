function downloadCertificate() {
    (async () => {

        const certificateAPI = '/users/getcertificate'
        Swal.fire({
            title: 'Participation Certificate',
            showCancelButton: true,
            didOpen: () => {
                swal.showLoading()
            }
        })
        let done = false, valid = false, googleName = "";
        await fetch(certificateAPI)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes('application/json')) {
                    done = true;
                    valid = true;
                    response.blob().then(blob => {
                        saveAs(blob, "EnigmaCertificate.pdf");
                        // const url = window.URL.createObjectURL(new Blob([blob]));
                        // const link = document.createElement('a');
                        // link.href = url;
                        // link.setAttribute('download', `EnigmaCertificate.pdf`);
                        // document.body.appendChild(link);
                        // link.click();
                        // link.parentNode.removeChild(link);
                    })
                    return { done };
                }
                else {
                    return response.json();
                }
            })
            .then((data) => {
                done = data.done;
                valid = data.valid;
                googleName = data.name;
            })
            .catch((error) => { console.log(error); });

        var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (valid == false) {
            Swal.fire({
                icon: 'error',
                title: 'No Participation Certificate!',
                text: 'Not enough score/Not participated 😔'
            })
        }
        else {

            if (done == false) {
                Swal.fire({
                    title: 'Participation Certificate',
                    input: 'text',
                    inputLabel: 'Enter the name you want on certificate',
                    inputValue: googleName,
                    inputValidator: (certificateName) => {
                        if (!certificateName) {
                            return 'You need to write something!'
                        }
                        if (format.test(certificateName)) {
                            return 'Invalid certificate name!'
                        }
                    },
                    showLoaderOnConfirm: true,
                    preConfirm: (certificateName) => {
                        return fetch(certificateAPI, {
                            method: "POST",
                            body: JSON.stringify({
                                certificateName
                            }),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8"
                            }
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(response.statusText)
                                }
                                return response.blob()
                            })
                            .catch(error => {
                                Swal.showValidationMessage(
                                    `Request failed: ${error}`
                                )
                            })
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }).then((result) => {
                    if (result.isConfirmed) {
                        saveAs(result.value, "EnigmaCertificate.pdf");
                        Swal.fire({
                            icon: 'success',
                            title: 'Your certificate will be downloaded!'
                        })
                    }
                })
            }
            else {
                Swal.fire({
                    icon: 'success',
                    title: 'Your certificate will be downloaded!'
                })
            }
        }

    })()
}