

//---------------------------//
//--- Top Level Functions ---//
//---------------------------//

//export const serverURL = "http://localhost:3001/app"
export const serverURL = "https://msuh.a2hosted.com/app"

var classRecall = {};

var apiKey, uid
export async function modifyRow(apiKeyy, uidd, table, r, iconData, gradeInfoToggle) {
	return new Promise(async (resolve, reject) => {
		try {
			apiKey = apiKeyy
			uid = uidd
			await addData(table, r, iconData, gradeInfoToggle);
			resolve();
		} catch(e) {
			console.log("MGH: Error editing row: "+e);
			resolve();
		}
	})
}

async function addData(table, r, iconData, gradeInfoToggle) {
	// set up variables
	const row = table.rows[r]
	const firstCell = row.cells[0]
	const secondCell = row.cells[1]

	// child info
	var hasChild = false
	var child = null
	if(table.rows[r+1])
		hasChild = table.rows[r+1].classList.value.includes("MSU-card-child")
		child = table.rows[r+1]

	var isChild = row.classList.value.includes("MSU-card-child")
	
	// course and prof info
	var courseTitleRawHTML = firstCell.getElementsByClassName("MSU-course-subject-label")[0].querySelector('div').innerHTML
	var courseTitleRaw = firstCell.getElementsByClassName("MSU-course-subject-label")[0].querySelector('div').textContent
	var courseTitle = courseTitleRaw.replace(/\n/g, "").trim() // e.g. "IAH 202: Europe and the World (I)""

	var courseCodeRaw = courseTitle.split(':')[0] || "Unknown"
	var courseCode = courseTitle.split(':')[0].trim().replace(/ /g,"_") || "Unknown" // e.g. "IAH 202"

	var courseDetailLabelArr = firstCell.children[0].children[2].textContent.trim().split(" / ") || ["Unknnown", "Unknnown"]
	var courseSection = courseDetailLabelArr[0].split("Section ")[1] || "Unknnown"
	var courseNumber = courseDetailLabelArr[1].split("Class Nbr ")[1] || "Unknnown"

	var prof = secondCell.getElementsByClassName("ml-2")[0].innerText || "Unknnown"

	// credits
	var credits = parseFloat(firstCell.children[0].children[1].textContent.match(/\((\d*\.?\d*) units\)/)[1]) || 0.0
	
	// time
	var tempDiv = document.createElement("div");
	var timeHTML = firstCell.children[0].children[3].getElementsByClassName("ps-htmlarea")[0].innerHTML.replaceAll("<br>", " | ")
	tempDiv.innerHTML = timeHTML;
	var timeLabel = tempDiv.textContent.trim() || "Unknnown"
	tempDiv.remove()

	let semester = document.getElementById("TERM_VAL_TBL_DESCR").innerText.trim() || "Unknnown"

	row.courseTitle = courseTitle;
	row.courseSection = courseSection;
	row.courseNumber = courseNumber;
	row.credits = credits;
	row.prof = prof;
	row.time = timeLabel;
	row.semester = semester;
	row.hasChild = hasChild;
	row.isChild = isChild;
	if(hasChild)
		row.child = child
	else
		row.child = null

	// get data
	if(gradeInfoToggle) {
		let data;
		let profs = prof.split(", ");
		for(let p of profs) { // save info from first teacher that has info
			data = await getData(courseCode, p.replace(/ /g, "_"), apiKey, uid);
			if(data == "-1") return; // server offline or key invalid
			if(data.avgGrade != "??" && data.avgGrade != "???" && data.avgGrade != undefined) break
		}

		//---- First div Content ----//

		// create data element to append
		let pdata = document.createElement("span");
		if(data.avgGrade == "??" || data.avgGrade == "???")
			pdata.innerHTML = `Grade: <b style='color:${util.gpaToColor(data.avgGrade)}'>${data.avgGrade}</b>`;
		else 
			pdata.innerHTML = `Avg Grade: <b style='color:${util.gpaToColor(data.avgGrade)}'>${data.avgGrade}</b><br>
			Median Grade: <b style='color:${util.gpaToColor(data.medianGrade)}'>${data.medianGrade}</b><br>
			Total Students: <span>${data.totalStudents}</span>`;
		//Total Students: <b style='color:${util.studentsToColor(data.totalStudents)}'>${data.totalStudents}</b><br>

		// include grade information for class
		let addition = `<span style='color:${util.gpaToColor(data.classMedian)}'>${courseCodeRaw}${(data.classMedian != -1 ? ` (${data.classMedian})` : '')}</span>`;
		let courseCodeIdx = courseTitleRawHTML.indexOf(courseCodeRaw);
		let finalStr = courseTitleRawHTML.slice(0, courseCodeIdx) + addition + courseTitleRawHTML.slice(courseCodeIdx + courseCodeRaw.length);
		firstCell.getElementsByClassName("MSU-course-subject-label")[0].querySelector('div').innerHTML = finalStr;

		// check if secondCell info is already added
		if(row.getElementsByClassName("secondCellDiv").length != 0) return


		//---- Second div Content ----//
		
		// create div that will hold secondCell content
		var secondCellDiv = document.createElement("div");
		secondCellDiv.classList.add("secondCellDiv");
		for(let child of secondCell.children) {
			moveElement(child, secondCellDiv)
		}
		secondCell.appendChild(secondCellDiv)
		
		// fade in the newly gathered data
		pdata.style.fontSize = "90%"
		fadeIn(pdata, secondCellDiv);

		// move professor name so that its not padded towards center
		secondCellDiv.firstElementChild.removeChild(secondCellDiv.firstElementChild.getElementsByClassName("mb-4")[0])
		secondCellDiv.firstElementChild.style.padding = "10px 0px 10px"

		// remove extra padding at top of row
		row.style['border-top'] = "solid 5px #fff"
	}

	// add "add bookmark"
	const idiv = document.createElement("div");
	if(!isChild) {
		let ibookmark = document.createElement("i");
		ibookmark.title = "Bookmark";
		ibookmark.type = "Bookmark";
		ibookmark.classID = null;
		ibookmark.active = false;
		ibookmark.classList.add('fa-bookmark');

		for(let icon of [ibookmark]) {
			icon.row = row;
			icon.classList.add('myicon')
			icon.classList.add('fas');
			icon.onclick = iconClick;
			idiv.append(icon)
		}

		let rowIconData = iconData.filter(course => course.course_number === row.courseNumber);
		if(rowIconData) {
			for(let rowIcon of rowIconData) {
				ibookmark.classID = rowIcon.id;
				toggleIconstate(ibookmark, "Bookmark", row);
			}
		}
	}
	if(gradeInfoToggle)
		secondCellDiv.prepend(idiv);
	else
		secondCell.prepend(idiv)
}

//---------------------------------//
//--- Data Retrieving Functions ---//
//---------------------------------//

async function getData(courseCode, prof, apiKey, uid) {
	let data = {};
	let profNameList = prof.split("_")
	let profFirstName = profNameList[0]
	let profLastName = profNameList[profNameList.length - 1]

	var needClassData = false

	// class caching
	if(!classRecall[courseCode]) {
		needClassData = true
	} else { // use cached data
		data = {...(classRecall[courseCode].data)};
	}

	// teacher caching
	if(needClassData || !classRecall[courseCode].teachers[prof]) {

		let res = await queryTeacherInfo(courseCode, profFirstName, profLastName, apiKey, uid)

		if(needClassData) {
			classRecall[courseCode] = {};
			classRecall[courseCode].teachers = {};
			classRecall[courseCode].data = res;
		}

		// add to cache
		classRecall[courseCode].teachers[prof] = {};
		classRecall[courseCode].teachers[prof] = res;

		data = {...data, ...(res)} // update with new data
	} else { // use cached data
		data = {...data, ...(classRecall[courseCode].teachers[prof])};
	}
	return data
}

async function queryTeacherInfo(courseCode, profFirstName, profLastName, apiKey, uid) {
	let data = await makeRequest(
		serverURL+`/query/`,
		{
			"courseCode": courseCode, 
			"prof": profFirstName+"_"+profLastName
		},
		apiKey, uid
	);
	if(!data || Object.keys(data).length === 0)
		return "-1"
	return JSON.parse(data);
}

export async function getScheduleData(apiKey, uid) {
	let data = await makeRequest(
		serverURL+`/schedule/list/icons/`,
		{},
		apiKey, uid
	);
	return JSON.parse(data);
}

//------------------------//
//--- Back End Helpers ---//
//------------------------//

export function sendMessagePromise(action, url, header, body) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({"action": action, "url": url, "header": header, "body": body}, response => {
            if(response) {
                resolve(response);
            } else {
                reject('Sending message to background went wrong');
            }
        });
    });
}

export async function makeRequest(url, body={}, apiKey=0, uid=0) {
    return await sendMessagePromise("request", url, [apiKey, uid], body);
}


//----------------------//
//--- Styling Helper ---//
//----------------------//

export function fadeIn(element, location, speed=0.5) {
	return new Promise((resolve, reject) => {
		location.append(element);

		element.style.opacity = "0";
	
		setTimeout(function() {
			element.style.transition = `opacity ${speed}s ease-in`;
			element.style.opacity = "1";
			resolve();
		}, 10);
	});
}

export function fadeOut(element, speed=0.5) {
	return new Promise((resolve, reject) => {
		element.style.opacity = "1";
	
		setTimeout(function() {
			element.style.transition = `opacity ${speed}s ease-out`;
			element.style.opacity = "0";
		}, 10);
		setTimeout(function() {
			element.remove();
			resolve();
		}, 20 + (parseFloat(speed)*1000));
	});
}

function moveElement(element, location) {
	var fragment = document.createDocumentFragment();
	fragment.appendChild(element);
	location.appendChild(fragment);
}


//------------------//
//--- Icon Logic ---//
//------------------//

async function iconClick(e) {
	e.stopPropagation();
    e.preventDefault();
	let element = e.target;
	let row = element.row;

	if(element.active == false) {
		try {
			let childID = null;
			if(row.hasChild)
				childID = (await addClass(row.child, element))["classID"];

			let resultID = (await addClass(row, element, childID))["classID"];
			if(!resultID) throw("no changes")

			element.classID = resultID;
		} catch(e) {
			console.log("Warning while adding class: "+e)
			// asume class was added elsewhere
		}
	} else if(element.active == true) {
		try {
			let changes = JSON.parse(await makeRequest(
				serverURL+`/schedule/remove/`,
				{
					"classID": element.classID
				},
				apiKey, uid
			))["changes"];
			if(!changes || parseInt(changes) <= 0) throw("no changes")
			element.classID = null;
		} catch(e) {
			console.log("Warning while removing class: "+e)
			// assume class was removed elsewhere
			element.classID = null;
		}
	}
	toggleIconstate(element, element.type, row);
}

function toggleIconstate(element, type, row = null) {
	element.active = !element.active // toggle state
	if(type == "Schedule") {
		element.classList.toggle('fa-calendar-active')
	} else if(type == "Bookmark") {
		element.classList.toggle('fa-bookmark-active')
	}
}

async function addClass(row, element, childID = null) {
	return new Promise(async (resolve, reject) => {
		try {
			let res = JSON.parse(await makeRequest(
				serverURL+`/schedule/add/`,
				{
					"courseTitle": row.courseTitle,
					"courseSection": row.courseSection,
					"courseNumber": row.courseNumber,
					"credits": row.credits,
					"professor": row.prof,
					"time": row.time,
					"semester": row.semester,
					"is_bookmark": (element.type == "Bookmark"),
					"is_child": row.isChild,
					"childClass": childID
				},
				apiKey, uid
			));
			resolve(res);
		} catch(e) {
			console.log(e)
			reject();
		}
	})
}