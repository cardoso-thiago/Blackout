(function() {
	var timerUpdateDate = 0, colorIndex = 0, backgroundIndex = 0, tapedTwice = false,
			battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery, 
			interval, 
			arrBackground = ["url('./images/Abstract-Timekeeper.svg')", "url('./images/brick-wall.svg')", 
			                 "url('./images/Bullseye-Gradient.svg')", "url('./images/charlie-brown.svg')",
			                 "url('./images/circuit-board.svg')", "url('./images/dominos.svg')", 
			                 "url('./images/Endless-Constellation.svg')", "url('./images/line-in-motion.svg')", 
			                 "url('./images/Subtle-Prism.svg')", "url('./images/tic-tac-toe.svg')", 
			                 "url('./images/topography.svg')", "url('./images/Wavey-Fingerprint.svg')"],
	        arrBackgroundSize = ["720px", "45px", "360px", "45px", "360px", "90px", "360px",
	                             "180px", "360px", "90px", "360px", "360px"],
			arrDay = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ], 
			arrMonth = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ], 
			arrColorLeft= [ "#02AAB0", "#D31027", "#2B32B2", "#076585", "#00b09b", "#3f2b96", "#333399", "#330867" ],
			arrColorRight = [ "#00CDAC", "#EA384D", "#1488CC", "#fff", "#96c93d", "#a8c0ff", "#ff00cc", "#30CFD0" ];

	/**
	 * Updates the date and sets refresh callback on the next day.
	 * 
	 * @private
	 * @param {number}
	 *            prevDay - date of the previous day
	 */
	function updateDate(prevDay) {
		var datetime = tizen.time.getCurrentDateTime(), nextInterval, strDay = document
				.getElementById("str-day"), strFullDate, getDay = datetime
				.getDay(), getDate = datetime.getDate(), getMonth = datetime
				.getMonth();

		// Check the update condition.
		// if prevDate is '0', it will always update the date.
		if (prevDay !== null) {
			if (prevDay === getDay) {
				/**
				 * If the date was not changed (meaning that something went
				 * wrong), call updateDate again after a second.
				 */
				nextInterval = 1000;
			} else {
				/**
				 * If the day was changed, call updateDate at the beginning of
				 * the next day.
				 */
				// Calculate how much time is left until the next day.
				nextInterval = (23 - datetime.getHours()) * 60 * 60 * 1000 + 
				(59 - datetime.getMinutes()) * 60 * 1000 + 
				(59 - datetime.getSeconds()) * 1000 +
				(1000 - datetime.getMilliseconds()) + 1;
			}
		}

		if (getDate < 10) {
			getDate = "0" + getDate;
		}

		strFullDate = arrDay[getDay].toUpperCase() + " " + getDate + " " + arrMonth[getMonth].toUpperCase();
		strDay.innerHTML = strFullDate;

		// If an updateDate timer already exists, clear the previous timer.
		if (timerUpdateDate) {
			clearTimeout(timerUpdateDate);
		}

		// Set next timeout for date update.
		timerUpdateDate = setTimeout(function() {
			updateDate(getDay);
		}, nextInterval);
	}

	/**
	 * Updates the current time.
	 * 
	 * @private
	 */
	function updateTime() {
		var strHours = document.getElementById("str-hours"),
		strMinutes = document.getElementById("str-minutes"), 
		datetime = tizen.time.getCurrentDateTime(), 
		hour = datetime.getHours(), 
		minute = datetime.getMinutes();

		strHours.innerHTML = hour;
		strMinutes.innerHTML = minute;

		if (hour < 10) {
			strHours.innerHTML = "0" + hour;
		}
		if (minute < 10) {
			strMinutes.innerHTML = "0" + minute;
		}
	}

	/**
	 * Sets to background image, and starts timer for normal
	 * digital watch mode.
	 * 
	 * @private
	 */
	function initDigitalWatch() {
		document.getElementById("digital-body").style.backgroundColor = "#000000";
		document.getElementById("digital-body").style.backgroundImage = arrBackground[backgroundIndex];
		document.getElementById("digital-body").style.backgroundSize = arrBackgroundSize[backgroundIndex];
		document.getElementById("str-hours").style.background = "linear-gradient(to right, " + arrColorLeft[colorIndex] + 
		" 0%, " + arrColorRight[colorIndex] + " 100%)";
		document.getElementById("str-hours").style.webkitBackgroundClip = "text";
		document.getElementById("str-hours").style.webkitTextFillColor = "transparent";
		interval = setInterval(updateTime, 500);
	}

	/**
	 * Clears timer and sets background image as none for ambient digital watch
	 * mode.
	 * 
	 * @private
	 */
	function ambientDigitalWatch() {
		clearInterval(interval);
		document.getElementById("digital-body").style.backgroundImage = "none";
		document.getElementById("str-hours").style.color = "white";
		updateTime();
	}

	/**
	 * gets battery state. updates battery level.
	 * 
	 * @private
	 */
	function getBatteryState() {
		var strBattery = document.getElementById("str-battery");
		strBattery.innerHTML = Math.ceil(battery.level * 100) + "%";
	}

	/**
	 * Updates watch screen. (time and date)
	 * 
	 * @private
	 */
	function updateWatch() {
		updateTime();
		updateDate(0);
	}

	/**
	 * Binds events.
	 * 
	 * @private
	 */
	function bindEvents() {
		// add eventListener for battery state
		battery.addEventListener("chargingchange", getBatteryState);
		battery.addEventListener("chargingtimechange", getBatteryState);
		battery.addEventListener("dischargingtimechange", getBatteryState);
		battery.addEventListener("levelchange", getBatteryState);	

		// add eventListener for timetick
		window.addEventListener("timetick", function() {
			ambientDigitalWatch();
		});

		// add eventListener for ambientmodechanged
		window.addEventListener("ambientmodechanged", function(e) {
			if (e.detail.ambientMode === true) {
				// rendering ambient mode case
				ambientDigitalWatch();

			} else {
				// rendering normal digital mode case
				initDigitalWatch();
			}
		});

		// add eventListener to update the screen immediately when the device
		// wakes up.
		document.addEventListener("visibilitychange", function() {
			if (!document.hidden) {
				updateWatch();
			}
		});

		// add event listeners to update watch screen when the time zone is
		// changed.
		tizen.time.setTimezoneChangeListener(function() {
			updateWatch();
		});

		document.getElementById("str-hours").addEventListener("touchstart",
				doubleTapHourHandler);
		document.getElementById("str-minutes").addEventListener("touchstart",
				tapMinuteHandler);
		document.getElementById("digital-body").addEventListener("touchstart",
				doubleTapBackgroundHandler);
	}
	
	function doubleTapHourHandler(event) {
		if (!tapedTwice) {
			tapedTwice = true;
			setTimeout(function() {
				tapedTwice = false;
			}, 300);
			return false;
		}
		event.preventDefault();
		
		colorIndex = colorIndex + 1;
		if (colorIndex >= arrColorLeft.length) {
			colorIndex = 0;
		}
		document.getElementById("str-hours").style.background = "linear-gradient(to right, " + arrColorLeft[colorIndex] + 
		" 0%, " + arrColorRight[colorIndex] + " 100%)";
		document.getElementById("str-hours").style.webkitBackgroundClip = "text";
		document.getElementById("str-hours").style.webkitTextFillColor = "transparent";
	}

	function tapMinuteHandler() {
		tizen.application.launch("com.samsung.timer-wc1", onsuccess);
	}

	function onsuccess() {
		console.log("The application has launched successfully");
	}
	
	function doubleTapBackgroundHandler(event) {
		if (!tapedTwice) {
			tapedTwice = true;
			setTimeout(function() {
				tapedTwice = false;
			}, 300);
			return false;
		}
		event.preventDefault();

		backgroundIndex = backgroundIndex + 1;
		if (backgroundIndex >= arrBackground.length) {
			backgroundIndex = 0;
		}
		document.getElementById("digital-body").style.backgroundImage = arrBackground[backgroundIndex];
		document.getElementById("digital-body").style.backgroundSize = arrBackgroundSize[backgroundIndex];
	}
	
	/**
	 * Initializes date and time. Sets to digital mode.
	 * 
	 * @private
	 */
	function init() {
		initDigitalWatch();
		updateDate(0);

		bindEvents();
	}

	window.onload = init();
}());
