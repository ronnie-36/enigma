jQuery(function ($) {
    $(window).on('scroll', function () {
        if ($(this).scrollTop() >= 200) {
            $('.navbar').addClass('fixed-top');
        } else if ($(this).scrollTop() == 0) {
            $('.navbar').removeClass('fixed-top');
        }
    });

    function adjustNav() {
        var winWidth = $(window).width(),
            dropdown = $('.dropdown'),
            dropdownMenu = $('.dropdown-menu');

        if (winWidth >= 768) {
            dropdown.on('mouseenter', function () {
                $(this).addClass('show')
                    .children(dropdownMenu).addClass('show');
            });

            dropdown.on('mouseleave', function () {
                $(this).removeClass('show')
                    .children(dropdownMenu).removeClass('show');
            });
        } else {
            dropdown.off('mouseenter mouseleave');
        }
    }

    $(window).on('resize', adjustNav);

    adjustNav();
});

const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})
$(document).ready(function () {
    $('.submit_custom').on("click", function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        if (form.serializeArray()[1].value == "") {
            Toast.fire({
                icon: 'warning',
                title: 'Empty answer field.'
            });
        } else {
            $.ajax({
                url: '/play/practice',
                type: 'post',
                data: form.serializeArray(),
                beforeSend: function () {
                    $("#overlay").show();
                },
                success: function (response) {
                    if (!response.login) {
                        location.reload();
                    } else {
                        if (response.fun == 0) {
                            fail();
                        } else if (response.fun == 2) {
                            close();
                        } else if (response.fun == 1) {
                            success();
                            setTimeout('location.reload()', 1000);
                        }
                    }
                },
                complete: function (data) {
                    $("#overlay").hide();
                }
            });
        }
    });
});
window.addEventListener("load", () => {
    document.querySelector("#clear").addEventListener("click", e => {
        console.log("here");
        sessionStorage.removeItem('loginflash');
        sessionStorage.removeItem('registerflash');
    });
});