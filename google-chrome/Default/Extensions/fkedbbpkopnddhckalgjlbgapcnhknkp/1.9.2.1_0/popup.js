
const formPage = document.getElementById("form-page");
const apiKeyInput = document.getElementById("apiKey");
const apiKeyForm = document.getElementById("api-key-form");

const successPage = document.getElementById("signed-in-page");
const serverStatus = document.getElementById("serverStatus");
const scheduleLink = document.getElementById("schedule-link");
const signOutButton = document.getElementById("sign-out-button");
const gradeInfoToggle = document.getElementById("grade-info-toggle");

const paymentPage = document.getElementById("paymentPage");
const paymentLink = document.getElementById("payment-link");
const paymentBackLink = document.getElementById("payment-back-link");
const paymentIframe = document.getElementById("payment-iframe");

const errorNotification = document.getElementById("error-notification");
const errorMessage = document.getElementById("error-message");

var util, MGH;
(async () => { // dynamic import
	util = await import(chrome.runtime.getURL("util.js"));
	MGH = await import(chrome.runtime.getURL("MGH.js"));

	updateStatus(false);
})();

//------------------------//
//--- Helper Functions ---//
//------------------------//
function validateApiKey(apiKey) {
	const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
	return regex.test(apiKey);
}

async function testApiKeyAccess(apiKey) {
	let uid = await util.getUid();
	return await MGH.makeRequest(MGH.serverURL + "/signin/", {}, apiKey, uid);
}

async function getServerStatus() {
	return new Promise(async (resolve, reject) => {
		let status = await MGH.makeRequest(MGH.serverURL + "/status/");
		console.log(status)
		if(!status || status == 404) {
			resolve(0)
		} else {
			status = (JSON.parse(status))["status"]
			if(status == 1) {
				resolve(1)
			} else {
				resolve(0)
			}
		}
	})
}

//---------------------//
//--- Form Handling ---//
//---------------------//

// Submit
apiKeyForm.addEventListener("submit", async function(event) {
	event.preventDefault();

	let apiKey = apiKeyInput.value.trim();

	if (validateApiKey(apiKey)) {
		let access = await testApiKeyAccess(apiKey);

		if(!access || access == 404) {
			errorNotif("Server offline.");
			return
		}
		access = (JSON.parse(access))["access"]
		if(access == "-1") {
			errorNotif("Invalid app key");

		} else if(access == "-2") {
			errorNotif("This app key is being used in another client.");

		} else if(access == "1") {
			chrome.storage.local.set({"x-api-key": apiKey}, function() {
				updateStatus();
			});
		}
	} else {
		errorNotif("Invalid app key format.<br>Please use the format: XXXX-XXXX-XXXX-XXXX.");
	}
});

// Sign out
signOutButton.addEventListener("click", async () => {

	// update server status
	let status = await getServerStatus();
	if(status != 1) {
		errorNotif("Server is offline.");
		return
	}

	let apiKey = (await chrome.storage.local.get("x-api-key"))["x-api-key"];
	let uid = await util.getUid();

	apiKeyInput.value = apiKey; // set input to "old" key
	await MGH.makeRequest(MGH.serverURL + "/signout/", {}, apiKey, uid);

	await chrome.storage.local.set({"last-x-api-key": apiKey}); // save "last" api key
	await chrome.storage.local.set({"x-api-key": ""}); // reset current api key

	updateStatus();
});

// Payment Link
paymentLink.addEventListener("click", () => {
	paymentIframe.src = MGH.serverURL+"/payment.html";
	transitionPages(formPage, paymentPage);
});
// Back
paymentBackLink.addEventListener("click", async () => {
	await transitionPages(paymentPage, formPage);
	paymentIframe.src = "";
});

// My Schedule
scheduleLink.addEventListener("click", async (event) => {
	chrome.tabs.create({ url: chrome.runtime.getURL("schedule/schedule.html") });
});

// Grade Info
gradeInfoToggle.addEventListener("change", async (event) => {
	let gradeInfoStatus = event.target.checked;
	util.setStorage("grade-info-toggle", gradeInfoStatus)
});


//-----------------------//
//--- Styling Helpers ---//
//-----------------------//
function transitionPages(oldPage, newPage) {
	return new Promise((resolve, reject) => {
		oldPage.style.transition = "opacity 0.4s ease-out";
		oldPage.style.opacity = "0";

		setTimeout(function() {
			oldPage.style.display = "none";

			newPage.style.opacity = "0";
			newPage.style.display = "block";
		}, 400);

		setTimeout(function() {
			newPage.style.transition = "opacity 0.4s ease-in";
			newPage.style.opacity = "1";
			resolve();
		}, 430);
	});
}

function updateStatus(transition=true) {
	chrome.storage.local.get("x-api-key", async function(result) {
		if (result["x-api-key"] && result["x-api-key"] != "") {

			// update statuses
			let gradeInfoState = await util.getStorage("grade-info-toggle");
			if(gradeInfoState == "-1") {
				gradeInfoState = true;
				util.setStorage("grade-info-toggle", true);
			}
			gradeInfoToggle.checked = gradeInfoState;
			
			// show signed in page
			if(transition) {
				await transitionPages(formPage, successPage);
			
				// get rid of error notifs
				errorNotification.style.transition = "opacity 1s ease-out";
				errorNotification.style.opacity = "0";
				setTimeout(function() {
					errorNotification.style.display = "none";
				}, 1000);
			} else {
				formPage.style.display = "none";
				successPage.style.display = "block";
			}

			// update server status
			let status = await getServerStatus();
			if(status == 1) 
				serverStatus.innerHTML = "<span class='success'>online</span>"
			else
				serverStatus.innerHTML = "<span class='error'>offline</span>"
			
		} else {
			// show sign in page
			if(transition)
				await transitionPages(successPage, formPage);
			else {
				successPage.style.display = "none";
				formPage.style.display = "block";
			}
			let lastApiKey = (await chrome.storage.local.get("last-x-api-key"))["last-x-api-key"] || "";
			apiKeyInput.value = lastApiKey
			apiKeyInput.focus()
		}
	});
}

function errorNotif(message) {
    errorMessage.innerHTML = message;

    errorNotification.style.opacity = "0";
    errorNotification.style.display = "block";

    setTimeout(function() {
        errorNotification.style.transition = "opacity 0.5s ease-in";
        errorNotification.style.opacity = "1";
    }, 10);
    setTimeout(function() {
        errorNotification.style.transition = "opacity 1s ease-out";
        errorNotification.style.opacity = "0";
    }, 6000);
    setTimeout(function() {
        errorNotification.style.display = "none";
    }, 7000);
}