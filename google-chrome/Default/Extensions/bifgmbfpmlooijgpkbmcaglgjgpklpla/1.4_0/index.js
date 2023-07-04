
// Only add the script to the top frame
if (window.top === window.self) {
	console.log('Loaded WebWork helper!')
	
	let copyright = document.getElementById("copyright").innerHTML;
	var query = "ww_version: ";
	var version_str = copyright.substring(
		copyright.indexOf(query) + query.length, 
		copyright.lastIndexOf(" |")
	);
	var version = Number(version_str.replace(/[^0-9\.]+/g,""))
	console.log("Detected version: "+version)

	let assignemnts_table_selector = "#hws0 table"
	let problems_table_selector = "#content div.body table"

	let link_location = 1 // skip download column
	if(version == 2.14) {
		link_location = 0
	}

	async function addToTable(table) {
		let pos = 0; // column position in table
		let textAlign = "right"
		let parser = new DOMParser();

		let thead_cell = table.rows[0].insertCell(pos)
		thead_cell.innerHTML = "<b>Completion</b>"
		thead_cell.style.textAlign= textAlign;
		thead_cell.width = "10%";
		let newCells = []
		for(let i = 1, row; row = table.rows[i]; i++) {
			newCells.push(row.insertCell(pos))
		}

		for (let i = 1, row; row = table.rows[i]; i++) { // skip first row
			let button_href = row.getElementsByTagName("a")[link_location].href;
			let assignmentTotal = 0;
			let assignmentScore = 0;
			new Promise((resolve, reject) => {
				fetch(button_href.toString()).then( (res) => {
					return res.text()
				}).then( (text) => {
					var doc = parser.parseFromString(text, "text/html");
		
					let problems_table = doc.querySelector(problems_table_selector);
					for (var w = 1, r; r = problems_table.rows[w]; w++) { // skip first row
						var cells = problems_table.rows[w].getElementsByTagName('td');
						let worth = cells[3].innerHTML;
						if(worth == 0) continue;
						let percent = cells[4].innerHTML;
						percent = parseInt(percent.slice(0,-1));
						assignmentScore += percent/100;
						assignmentTotal++;
					}
					resolve([i, assignmentScore, assignmentTotal]);
					return true;
				});
			}).then( (values) => {
				let assignmentScore = values[1];
				let assignmentTotal = values[2];
				let assignmentShow = 0;
				if(assignmentTotal == 0) assignmentShow = 1
				else assignmentShow = assignmentScore/assignmentTotal
				newCells[values[0]-1].innerHTML = `<b style='color:${scoreToColor(assignmentShow)}'>
											${assignmentScore}/${assignmentTotal} - ${Math.round(assignmentShow*100, 0)}%
										  </b>`
				newCells[values[0]-1].style.textAlign = textAlign;
			})
		}
	}

	function scoreToColor(n) {
		if(n == -1) return "#000000";
		let perc = n * 100
		if(perc < 0) perc = 0;
		if(perc > 100) perc = 100;
		var r, g, b = 0;
		if(perc < 50) {
			r = 200;
			g = Math.round(5.1 * perc);
		}
		else {
			g = 200;
			r = Math.round(510 - 5.10 * perc);
		}
		var h = r * 0x10000 + g * 0x100 + b * 0x1;
		return '#' + ('000000' + h.toString(16)).slice(-6);
	}

	// Start interval to check for the existence of container where we want to add the buttons
	let old_table = null;
	let checkTime = 100;
	let checkAmount = 0;
	let interval = function () {
		let table = document.querySelector(assignemnts_table_selector)

		if (table && old_table != table) {
			if(table.rows.length > 1) {
				checkTime = 2000;
				console.log("FOUND TABLE, rows: ",table.rows.length);
				old_table = table;
				addToTable(table);
			}
		}
		checkAmount++;
		if(checkAmount > 50)
			checkTime = 2000;
		setTimeout(interval, checkTime);
	}
	setTimeout(interval, checkTime);

}