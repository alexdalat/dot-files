


chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

	if(request.action == "request") { // simple request
		if(request.header[0] && request.header[1] && request.header[0] != 0 && request.header[1] != 0) {
			header = {
				'x-api-key': request.header[0],
				'x-uid': request.header[1],
				'Cache-Control': 'no-cache'
			}
		} else {
			header = {
				'Cache-Control': 'no-cache'
			}
		}
		let params = {
			headers: header
		}

		// if request body is empty, use GET method
		if(request.body && Object.keys(request.body).length == 0 && Object.getPrototypeOf(request.body) == Object.prototype) {
			params["method"] = "GET"
		} else {
			params["method"] = "POST"
			params["headers"]["Content-Type"] = "application/x-www-form-urlencoded"
			params["body"] = new URLSearchParams(request.body)
		}

		fetch(request.url, params).then( (res) => {
			return res.text()
		}).then( (text) => {
			sendResponse(text);
			return text
		}).catch((e) => {
			sendResponse(404);
			console.log("Error: " + e)
			return e
		});
	}
	return true
});
