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

function handleTickInit(tick) {
	// using this because initial labels are wrong
	// var locale = {
	//     YEAR_PLURAL: 'Jaren',
	//     YEAR_SINGULAR: 'Jaar',
	//     MONTH_PLURAL: 'Maanden',
	//     MONTH_SINGULAR: 'Maand',
	//     WEEK_PLURAL: 'Weken',
	//     WEEK_SINGULAR: 'Week',
	//     DAY_PLURAL: 'HRS',
	//     DAY_SINGULAR: 'HR',
	//     HOUR_PLURAL: 'MINS',
	//     HOUR_SINGULAR: 'MIN',
	//     MINUTE_PLURAL: 'SEC',
	//     MINUTE_SINGULAR: 'SEC',
	//     SECOND_PLURAL: 'Seconden',
	//     SECOND_SINGULAR: 'Seconde',
	//     MILLISECOND_PLURAL: 'Milliseconden',
	//     MILLISECOND_SINGULAR: 'Milliseconde'
	// };

	// for (var key in locale) {
	//     if (!locale.hasOwnProperty(key)) { continue; }
	//     tick.setConstant(key, locale[key]);
	// }
	// format of due date is ISO8601
	// https://en.wikipedia.org/wiki/ISO_8601

	// '2018-01-31T12:00:00'        to count down to the 31st of January 2018 at 12 o'clock
	// '2019'                       to count down to 2019
	// '2018-01-15T10:00:00+01:00'  to count down to the 15th of January 2018 at 10 o'clock in timezone GMT+1

	// create the countdown counter
	var counter = Tick.count.down('2022-04-26T00:00:00+05:30', {
		format: ['h', 'm', 's']
	});

	counter.onupdate = function (value) {
		tick.value = value;
		if (Tick.helper.duration(Tick.helper.date(), Tick.helper.date('2022-04-26T00:00:00+05:30'), ['s'])[0] == 10) {
			setInterval(function () {
				$("#timebox").toggleClass("backgroundRed");
			}, 500)
		};
	};

	counter.onended = function () {

		window.location = '/play'
		// show message, uncomment the next line
		// document.querySelector('.tick-onended-message').style.display = '';
	};
}
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
				url: '/play',
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