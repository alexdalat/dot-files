

const verbose = false;

if(verbose) console.log("MCH: Loading resources...")

var util, MGH
var uid, apiKey

(async () => { // dynamic import
	util = await import(chrome.runtime.getURL("util.js"));
	MGH = await import(chrome.runtime.getURL("MGH.js"));

	if (window.top === window.self) {

		console.log("MCH: Loaded!")

		async function addToTable(table) {
			// get uid and api key
			try {
				uid = await util.getUid();
				apiKey = await util.getKey();
			} catch(e) {
				console.log("MCH: Error getting uid or key: " + e);
				return
			}
			
			// check if user is authenticated
			if(!(await util.isValid(apiKey))) {
				ready = true;
				console.log("MCH: User not authenticated.");
				return
			}
			console.log("MCH: User authenticated.");

			// get icon data
			let iconData;
			try {
				iconData = await MGH.getScheduleData(apiKey, uid);
			} catch(e) {
				console.log("MCH: Error getting schedule data: "+e);
				return
			}

			// filter icon data for selected semester
			let semester = document.getElementById("TERM_VAL_TBL_DESCR").innerText.trim() || "Unknnown"
			if(verbose) 
				console.log("MCH: Semester: "+semester);
			iconData = iconData.filter((e) => e.semester == semester || e.semestser == null);

			// get grade info toggle
			let gradeInfoToggle = await util.getStorage("grade-info-toggle");
			if(gradeInfoToggle == "-1") {
				gradeInfoToggle = true;
				await util.setStorage("grade-info-toggle", true);
			}
			
			// add data to table
			for (let i = 0; i < table.rows.length; i++) {
				await MGH.modifyRow(apiKey, uid, table, i, iconData, gradeInfoToggle); // edit each row to add information
			}

			old_table = table.cloneNode(true);
			ready = true;
		}

		let ready = true;
		let old_table = null;
		setInterval(function () {
			if(!ready) return;

			let table = document.querySelector(".psc_panel-content table")

			if (table && table.rows.length >= 1 && (!old_table || !old_table.rows[0].cells[0].isEqualNode(table.rows[0].cells[0]))) {

				// verify it's a list with table results
				let results = document.getElementById("MSU_RSLT_NAV_WK_PTPG_ROWS_GRID").textContent.trim();
				if(!results.includes("result"))
					return

				let nresults = results.split(" ")[0].trim()
				if(verbose) 
					console.log("MCH: Found table, rows: ",nresults);

				ready = false;
				addToTable(table);
			}

		}, 2000);

	}

})();