

// Imports
import * as util from '../util.js'
import * as MGH from '../MGH.js'

// Data Storage
var colorData = {};

// Options
let showAllClasses = false;
let keybinds_enabled = false;

// Authentication
let uid = await util.getUid();
let apiKey = await util.getKey();

// Global Variables
let activeScheduleNum = "1";
let activeScheduleSemester = "N/A";
let updateAll = () => { console.error("updateAll() not defined, use setUpdateAllCallback(func)") };

// Constants
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const seasons = {
	'Winter': 0,
	'Spring': 1,
	'Summer': 2,
	'Fall': 3
};


//---------------------//
//--- View Updaters ---//
//---------------------//
export function updateTableView(tableViewBody, is_bookmark_table=false, scheduleData=null, timeData=null, localSchedule=null, can_edit=true) {
	return new Promise(async (resolve, reject) => {
		if(!localSchedule) {
			try {
				localSchedule = await getLocalSchedule();
			} catch(e) {
				console.error(e)
				return reject(e)
			}
		}
		if(!scheduleData)
			scheduleData = await getScheduleData();

		// filter based on semester
		scheduleData = scheduleData.filter(cls => cls.semester == activeScheduleSemester);

		let timeScheduleData = scheduleData.filter(cls => isInSchedule(cls.id, localSchedule));
		if(!timeData || !scheduleData)
			timeData = prepareTimeData(timeScheduleData);

		while (tableViewBody.firstChild)
			tableViewBody.removeChild(tableViewBody.firstChild);

		// filter based on table
		scheduleData = scheduleData.filter((cls) => {
			if(is_bookmark_table) {
				return !isInSchedule(cls.id, localSchedule)
			} else {
				return isInSchedule(cls.id, localSchedule)
			}
		});
		
		scheduleData.sort((a,b) => {
			if(is_bookmark_table)
				return a.course_title.localeCompare(b.course_title) // alphabetical sorting
			else
				return 0 // dont sort
		});

		if(showAllClasses == false && is_bookmark_table)
			var added_course_codes = getAddedCourseCodes(timeData, true); // get all added course codes

		// running info
		let running_credits = 0;
		let class_count = 0;

		// add classes to table
		scheduleData.forEach(cls => {

			if(showAllClasses == false && is_bookmark_table) { // filter bookmarked classes if the same code is already in the schedule
				let code = cls.course_title.split(":")[0] // e.g: "CSE 102"
				if(added_course_codes.includes(code))
					return;
			}
			let row = document.createElement('tr');
			let title = getTitle(cls, localSchedule, scheduleData);
			
			// check for conflicts
			let conflicts = checkForConflicts(cls, timeData)
			let time_span = (conflicts ? "<span style='color:rgb(134, 62, 20)'>" : "<span style='color:rgb(79, 121, 66)'>"); // string for time that is green or red

			row.innerHTML = `
				<td>${title}</td>
				<td>${cls.course_section}</td>
				<td>${cls.credits}</td>
				<td>${cls.course_number}</td>
				<td>${cls.professor}</td>
				<td>${time_span}${cls.time.replace(" | ", "<br>")}</span></td>
			`;

			let fillerRow = null;
			let rtd = document.createElement('td');
			let std = document.createElement('td');

			if(cls.is_child != "true") { // if not a child course
				if(can_edit) {
					let rbutton = document.createElement("button");
					rbutton.innerText = "X";
					rbutton.classList.add("remove-button")
					rbutton.onclick = removeClass
					rtd.appendChild(rbutton)

					let sbutton = document.createElement("button");
					sbutton.innerText = "#";
					sbutton.classList.add("switch-button")
					sbutton.onclick = switchType
					std.appendChild(sbutton)
				}

				fillerRow = document.createElement("tr")
				fillerRow.classList.add("blank_row")
				row.fillerRow = fillerRow
			}
			
			row.appendChild(std);
			row.appendChild(rtd);
			row.data = cls;

			if(!is_bookmark_table) {
				running_credits += parseInt(cls.credits);
				if(cls.is_child != "true") // if not a child course
					class_count++;
			}

			if(cls.is_child == "true")
				row.classList.add('child');
			else
				tableViewBody.appendChild(fillerRow);

			tableViewBody.appendChild(row);
		});

		if(!is_bookmark_table) {
			// add filler row
			let fillerRow = document.createElement("tr")
			fillerRow.classList.add("blank_row")
			tableViewBody.appendChild(fillerRow);

			// add running info
			let row = document.createElement('tr');
			row.style.color = "#ccc"
			row.innerHTML = `
				<td>Count: ${class_count}</td>
				<td></td>
				<td><b>${running_credits}</b></td>
				<td></td><td></td><td></td><td></td><td></td>
			`;
			tableViewBody.appendChild(row);
		}

		resolve();
	});
}

export function updateWeeklyView(weeklyViewTable, scheduleData=null, timeData=null, localSchedule=null, show_time=true, cell_height=6) {
	return new Promise(async (resolve, reject) => {
		if(!localSchedule) {
			try {
				localSchedule = await getLocalSchedule();
			} catch(e) {
				console.error(e);
				return
			}
		}
		if(!scheduleData)
			scheduleData = await getScheduleData();

		// filter classes that are in schedule
		scheduleData = scheduleData.filter(course => isInSchedule(course.id, localSchedule)); // takes care of semester filtering

		if(!timeData || !scheduleData)
			timeData = prepareTimeData(scheduleData);

		while (weeklyViewTable.firstChild) {
			weeklyViewTable.removeChild(weeklyViewTable.firstChild);
		}

		// figure out times for table
		let allTimesData = [].concat(...[].concat(...Object.values(timeData)).map(i => i.slice(1, 3))) // get all time data excluding title
		let maxTableStart = 620
		let minTableEnd = 960
		let tableStart = Math.min(Math.min(...allTimesData) - 30, maxTableStart);
		let tableEnd = Math.max(Math.max(...allTimesData) + 30, minTableEnd);

		/*** Set up table ***/
		for(let m = tableStart; m <= tableEnd; m += 5) { // 5 min interval
			var hours = Math.floor(m / 60);
			let shours = ((hours + 11) % 12 + 1);
			var minutes = m % 60

			let row = document.createElement("tr");
			let td = document.createElement("td");
			if(m % 60 == 0) { // show time every 30 min
				td.innerHTML = `<b>${shours}:${str_pad_left(minutes, '0', 2)} ${hours >= 12 ? "PM" : "AM"}</b>`;
				row.classList.add("timeLabel")
			}
			if(hours == 12 && minutes == 0) {
				row.style.borderTop = "1px dashed #555";
			}
			row.appendChild(td);
			weeklyViewTable.append(row);
		}

		/*** Add data ***/
		for(let day of daysOfWeek) {
			let dayData = timeData[day]

			let dayCellIdx = daysOfWeek.indexOf(day) + 1; // add 1 for time cell
			dayData = resolveTimeConflicts(dayData);
			
			for(let [cinfo, start, end, rstart, rend] of dayData) {
				if(end - start <= 0) continue
				if(!rstart || !rend) {
					rstart = start
					rend = end
				}
				const row = weeklyViewTable.rows[Math.floor((start-tableStart) / 5)];
				if (row) {
					for(let cellIdx = 1; cellIdx < dayCellIdx; cellIdx++) { // check that cells before exist, otherwise add empty ones
						if(!row.cells[cellIdx]) {
							//check if cell is not being used by a cell (in a lower row) with a high rowspan
							let addSpacer = true
							for(let [,pstart, pend,,] of Object.values(timeData)[(cellIdx-1) % daysOfWeek.length]) {
								if (start >= pstart && timesConflict(start, end, pstart, pend))
									addSpacer = false;
							}
							if(addSpacer) {
								const ecell = document.createElement("td");
								row.appendChild(ecell); // space isn't claimed
							}
						}
					}
					let is_conflict = (cinfo.course_title.startsWith("Conflict"));
					let final_text = `<b>${cinfo.course_title.split(":")[0]}</b> ${is_conflict?"⚠<br />":""}(${cinfo.course_section})<br />${!is_conflict && show_time ? getTimeString(rstart, rend):""}`

					let color;
					if(cinfo.is_child == "true") {
						parent = getParent(cinfo.id, scheduleData);
						if(parent)
							color = getColorData(parent, true) || "hotpink";
						else
							color = "hotpink";
					} else {
						color = getColorData(cinfo) || "hotpink";
					}
					const cell = createEventCell(start, end, final_text, color, cell_height);

					row.appendChild(cell);
				}
			}
		}
		resolve();
	})
}


//---------------------------//
//--- Weekly View Helpers ---//
//---------------------------//

function createEventCell(start, end, name = "404", color = "hotpink", cell_height=6) {
	const rowspan = Math.round((end - start)/5);
	const td = document.createElement('td');
	td.style.backgroundColor = color;
	td.style.border = '1px solid #aaa';
	td.setAttribute('rowspan', rowspan);

	// div is necessary to make sure the row/td stays the same height
	const div = document.createElement('div')
	div.style.height = rowspan*cell_height+"px";
	div.style.lineHeight = rowspan*cell_height+"px";
	div.style.overflow = 'hidden';

	// span is necessary to make sure the text is centered
	const span = document.createElement('span')
	span.innerHTML = name;
	span.style.lineHeight = "16px"; // spacing between title and time
	span.style.verticalAlign = "middle";
	span.style.display = "inline-block";
	div.appendChild(span);
	
	td.appendChild(div);
	return td;
}

function getTitle(cls, localSchedule, scheduleData) {
	let titleSplit = cls.course_title.indexOf(":")
	let color;
	if(cls.is_child == "true") {
		let is_child = true
		let parent = getParent(cls.id, scheduleData);
		if(!parent) {
			cls.is_child = false;
			parent = cls;
			is_child = false;
		}
		color = getColorData(parent, is_child) || "white";
	} else {
		color = getColorData(cls) || "white";
	}
	return `<span style='color:${color}'><b>${cls.course_title.slice(0,titleSplit)}</b>${cls.course_title.slice(titleSplit)}</span>`;
}


//--- Color Data Helpers ---//

function getColorData(cls, is_child=false) {
	let course_code = cls.course_title.split(":")[0];
	let color = colorData[course_code];
	let alpha = "1";
	if(is_child)
		alpha = "0.90"
	return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${alpha})`;
}

export function fillColorData(scheduleData) {
	let added_course_codes = getAddedCourseCodes(scheduleData);

	let range_arr = []; // array between 0 and 1 of length added_course_codes.length
	for(let idx = 0; idx < added_course_codes.length; idx++) {
		let val = Math.round(idx / added_course_codes.length * 100) / 100; // round to 4 places
		range_arr.push(val);
	}
	range_arr = seededShuffle(range_arr, 61423);

	for(let [idx, course_code] of added_course_codes.entries()) {

		let rand_hue = range_arr[idx] * 360; // 0-360
		let rand_sat = (360-rand_hue) % 10 + 40; // 30-50
		let rand_lum = (rand_hue) % 10 + 35; // 30-50

		colorData[course_code] = [Math.round(rand_hue*100)/100, Math.round(rand_sat*100)/100, Math.round(rand_lum*100)/100]
	}
	colorData["Conflict"] = [0, 80, 50];
}


//--- Schedule Query Helpers ---//

export function queryLocalSchedule() {
	return new Promise(async (resolve, reject) => {
		try {
			var localSchedule = await MGH.makeRequest(MGH.serverURL+'/schedule/local/', {}, apiKey, uid)
		} catch(e) {
			console.log("Error fetching local schedule data: "+e);
			return reject("Unknown query error.");
		}
		if(localSchedule == 404 || localSchedule == "Not Found") {
			return reject("Gateway inaccessible.") // server is offline or failed
		}
		try {
			localSchedule = JSON.parse(localSchedule)
		} catch(e) {
			setLocalSchedule({});
			localSchedule = {};
		}
		if(!localSchedule || localSchedule.message || localSchedule.error) {
			return reject("Authentication issue.") // authentication issue (shouldn't happen)
		}
		resolve(localSchedule);
	});
	//return localStorage.getItem("schedule");
}

export function setLocalSchedule(localSchedule) {
	return new Promise(async (resolve, reject) => {
		try {
			var response = await MGH.makeRequest(MGH.serverURL+'/schedule/local/set/', {schedule: JSON.stringify(localSchedule)}, apiKey, uid)
		} catch(e) {
			console.log("Error setting local schedule data: "+e);
			return reject("Unknown query error.");
		}
		if(response == 404 || response == "Not Found") {
			return reject("Gateway inaccessible.") // server is offline or failed
		}
	
		response = JSON.parse(response)
		if(!response || response.message || response.error) {
			return reject("Authentication issue.") // authentication issue (shouldn't happen)
		}
		resolve(response);
	});
	//localStorage.setItem("schedule", localSchedule);
}

export function getScheduleData() {
	return new Promise(async (resolve, reject) => {
		try {
			var scheduleData = await MGH.makeRequest(MGH.serverURL+'/schedule/list/', {}, apiKey, uid)
		} catch(e) {
			console.log("Error fetching schedule data: "+e);
			return resolve([]);
		}
		if(scheduleData == 404) {
			return resolve([]) // server is offline
		}
	
		scheduleData = JSON.parse(scheduleData)
		if(!scheduleData || scheduleData.message || scheduleData.error) {
			return resolve([]) // authentication issue (shouldn't happen)
		}
		resolve(scheduleData);
	});
}

function getAddedCourseCodes(scheduleData, time_data=false) {
	let added_course_codes = [];
	if(time_data == false) {
		for(let course of scheduleData) {
			let code = course.course_title.split(":")[0]
			if(added_course_codes.includes(code)) continue;
			added_course_codes.push(code);
		}
	} else {
		for(let data of Object.values(scheduleData)) {
			for(let course of data) {
				let code = course[0].course_title.split(":")[0]
				if(added_course_codes.includes(code)) continue;
				added_course_codes.push(code);
			}
		}
	}
	return added_course_codes;
}


//--- Time Data Helpers ---//

export function prepareTimeData(courses) {

	let timeData = {"Mon": [], "Tue": [], "Wed": [], "Thu": [], "Fri": [], "Sat": []}
	for(let course of courses) {
		let times = course.time.split(" | ")
		for(let time of times) {

			let timeInfo = getTimeRangeInMinutes(time);
			if(timeInfo == -1)
				continue

			for(let day of timeInfo[0]) {
				timeData[day].push([course, timeInfo[1], timeInfo[2], timeInfo[1], timeInfo[2]]);
			}
		}
	}
	for(let day of Object.keys(timeData)) {
		timeData[day] = timeData[day].sort((a,b) => a[1] - b[1]); // sort by start time
	}
	return timeData
}

export function getTimeRangeInMinutes(time) {
	if(time.indexOf(":") == -1)
		return -1
	try {
		const [days, timeRange] = time.split(' : ');
		const [start, end] = timeRange.split('-');
		const [startHour, startMinAndMeridiem] = start.split(':');
		const [startMinute, startMeridiem] = startMinAndMeridiem.split(' ');
		const [endHour, endMinAndMeridiem] = end.split(':');
		const [endMinute, endMeridiem] = endMinAndMeridiem.split(' ')
		const startMinutes = convertToMinutes(parseInt(startHour), parseInt(startMinute), startMeridiem);
		const endMinutes = convertToMinutes(parseInt(endHour), parseInt(endMinute), endMeridiem);
		return [days.split(" "), startMinutes, endMinutes];
	} catch(e) {
		return -1
	}
}

export function convertToMinutes(hour, minute, meridiem) {
	let minutes = hour * 60 + minute;
	if (meridiem === 'PM' && hour !== 12)
		minutes += 12 * 60;
	return minutes;
}

export function getTimeString(startMinutes, endMinutes) {
	const [startHour, startMinute, startMeridiem] = convertToString(startMinutes);
	const [endHour, endMinute, endMeridiem] = convertToString(endMinutes);
	const startTime = `${startHour}:${startMinute} ${startMeridiem}`;
	const endTime = `${endHour}:${endMinute} ${endMeridiem}`;
	return `${startTime} - ${endTime}`;
}
  
export function convertToString(minutes, return_arr = true) {
	const hour24 = Math.floor(minutes / 60);
	const hour12 = hour24 % 12 || 12;
	const minute = minutes % 60;
	const amPm = hour24 < 12 ? 'AM' : 'PM';
	if(return_arr == true)
		return [hour12.toString().padStart(2, '0'), minute.toString().padStart(2, '0'), amPm];
	else
		return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${amPm}`;
}

function resolveTimeConflicts(dayData) {
	const conflicts = [];
	for (let i = 0; i < dayData.length; i++) {
	  for (let j = i + 1; j < dayData.length; j++) {
		const [cinfo1, start1, end1, rstart1, rend1] = dayData[i];
		const [cinfo2, start2, end2, rstart2, rend2] = dayData[j];
		const title1 = cinfo1.course_title;
		const title2 = cinfo2.course_title;
		const conflictInfo = {course_title: `Conflict`, course_section: `${title1.split(":")[0]} and ${title2.split(":")[0]}`};
		if (start1 >= end2 || end1 <= start2) {
			// no conflict
			continue;
		} else if (start1 <= start2 && end1 >= end2) {
			// event2 is completely contained within event1 (works)
			dayData.push([cinfo1, start1, start2, rstart1, rend1]);
			dayData.push([conflictInfo, start2, end2]);
			dayData[j] = [cinfo2, start2, start2, rstart2, rend2]; // event 2
			dayData[i] = [cinfo1, end2, end1, rstart1, rend1];
		} else if (start1 >= start2 && end1 <= end2) {
			// event1 is completely contained within event2
			dayData.push([conflictInfo, start1, end1]);
			dayData[i] = [cinfo2, start2, start1, rstart2, rend2];
			dayData[j] = [cinfo2, end1, end2, rstart2, rend2]; // event 2
			i--;
			break;
		} else if (start1 <= start2 && end1 > start2 && end1 < end2) {
			// event2 starts within event1 and ends within event2
			dayData.push([conflictInfo, start2, end1]);
			dayData[j] = [cinfo1, start1, start2, rstart1, rend1]; // event 2
			dayData[i] = [cinfo2, end1, end2, rstart2, rend2];
		} else if (start1 > start2 && start1 < end2 && end1 >= end2) {
			// event2 starts before event1 and ends within event1
			dayData.push([conflictInfo, start1, end2]);
			dayData[i] = [cinfo2, start2, start1, rstart2, rend2];
			dayData[j] = [cinfo1, end2, end1, rstart1, rend1]; // event 2
			i--;
			break;
		} else if (start1 > start2 && end1 < end2) {
			// event1 is completely contained within event2
			dayData.push([conflictInfo, start1, end1]);
			dayData[i] = [cinfo2, start2, start1, rstart2, rend2];
			dayData.splice(j, 0, [title1, end1, end2, rstart1, rend1]);
			i--;
			break;
		}
	  }
	}
	return dayData.concat(conflicts);
}
  
export function timesConflict(start1, end1, start2, end2) {
	return (start1 >= start2 && start1 < end2) || (start2 >= start1 && start2 < end1);
	// return ((start1 <= start2 && end1 >= end2) || 
	// 	(start1 >= start2 && end1 <= end2) || 
	// 	(start1 <= start2 && end1 > start2 && end1 < end2) || 
	// 	(start1 > start2 && start1 < end2 && end1 >= end2) || 
	// 	(start1 > start2 && end1 < end2))
}

export function checkForConflicts(cls, timeData) {
	if(cls.time.indexOf(":") != -1) {
		let times = cls.time.split(" | ")

		for(let time of times) {
			let timeInfo = getTimeRangeInMinutes(time);
			if(timeInfo == -1)
				continue

			for(let day of timeInfo[0]) {
				let start = timeInfo[1];
				let end = timeInfo[2];

				for(let time of timeData[day]) {
					if(time[0].id == cls.id) continue;
					if(timesConflict(start, end, time[1], time[2])) {
						return true;
					}
				}
			}
		}
	}
	return false; // does not conflict
}



//------------------------------//
//--- Local Schedule Helpers ---//
//------------------------------//
export function setActiveScheduleNum(num) {
	activeScheduleNum = num;
	localStorage["lastScheduleNum"] = activeScheduleNum;
}

export function setActiveScheduleSemester(sem) {
	activeScheduleSemester = sem;
	localStorage["lastScheduleSemester"] = activeScheduleSemester;
}

export function verifyScheduleIntegrity(localSchedule=null, scData=null) {
	return new Promise(async (resolve, reject) => {
		let scheduleNum = activeScheduleNum;
		let scheduleSemester = activeScheduleSemester;
		if(!localSchedule) {
			try {
				localSchedule = await queryLocalSchedule();
			} catch(e) {
				reject(e);
			}
			if(!localSchedule) {
				await setLocalSchedule({}); // initialize
				localSchedule = {};
			}
		}
		if(scData != null) {
			for(let course of scData) { // go through every course in db
				let sem = course.semester || "N/A";

				if(!localSchedule[sem]) { // make sure this semester is visible
					localSchedule[sem] = {};
					await setLocalSchedule(localSchedule);
				}
				if(!scheduleSemester || scheduleSemester == "N/A") { // if no semester is selected, set it to the first one
					scheduleSemester = sem;
					setActiveScheduleSemester(sem);
				}
			}
		}
		if(!localSchedule[scheduleSemester]) { // if its still invalid, set it to the first semester
			localSchedule[scheduleSemester] = {};
			await setLocalSchedule(localSchedule);
		}
		if(!localSchedule[scheduleSemester][scheduleNum]) {
			localSchedule[scheduleSemester][scheduleNum] = [];
			await setLocalSchedule(localSchedule);
		}
		for(let cls of localSchedule[scheduleSemester][scheduleNum]) {
			// remove cls if is null or does not have id parameter
			if(cls == null) {
				let index = localSchedule[scheduleSemester][scheduleNum].indexOf(cls);
				localSchedule[scheduleSemester][scheduleNum].splice(index, 1);
				await setLocalSchedule(localSchedule);
			}
		}
		resolve(localSchedule);
	});
}

export async function updateOldScheduleFormat(localSchedule) {
	for(let scheduleSem of Object.keys(localSchedule)) {
		if(typeof localSchedule[scheduleSem] != "object" || (localSchedule[scheduleSem][0] && (typeof localSchedule[scheduleSem][0] == "number" || typeof localSchedule[scheduleSem][0] == "string"))) { // old format
			console.log("Deleting schedules with old format...");
			delete localSchedule[scheduleSem];
			await setLocalSchedule(localSchedule);
		}
	}
	return localSchedule;
}

export async function removeEmptySemesters(localSchedule, scheduleData) {
	for(let scheduleSem of Object.keys(localSchedule)) {
		if(scheduleData.some(cls => cls.semester == scheduleSem))
			continue;

		// if semester is N/A and there are no classes in the schedule, skip it
		if(scheduleSem == "N/A" && scheduleData.length == 0)
			continue;
		
		console.log("Deleting empty semester: " + scheduleSem);
		delete localSchedule[scheduleSem];
		await setLocalSchedule(localSchedule);

		if(scheduleSem == activeScheduleSemester) {
			let newScheduleSemester = findAvailableSemester(localSchedule, scheduleData);
			setActiveScheduleSemester(newScheduleSemester); // set to first available semester or N/A
			localSchedule = await verifyScheduleIntegrity(localSchedule);
		}
	}
	return localSchedule;
}

function findAvailableSemester(localSchedule, scheduleData) {
	for(let cls of scheduleData) {
		if(localSchedule[cls.semester])
			return cls.semester;
	}
	return "N/A";
}


export async function getLocalSchedule(localSchedule=null) {
	try {
		return await verifyScheduleIntegrity(localSchedule);
	} catch(e) {
		throw e;
	}
}

export function isInSchedule(cid, localSchedule, scheduleSemester=null, scheduleNum=null) {
	if(!scheduleNum)
		scheduleNum = activeScheduleNum;
	if(!scheduleSemester)
		scheduleSemester = activeScheduleSemester;
	return localSchedule[scheduleSemester][scheduleNum].includes(cid)
}

export async function addToSchedule(cid, localSchedule=null, scheduleSemester=null, scheduleNum=null) {
	if(!localSchedule) {
		try {
			localSchedule = await verifyScheduleIntegrity(localSchedule);
		} catch(e) {
			return null;
		}
	}
	if(!scheduleNum)
		scheduleNum = activeScheduleNum;
	if(!scheduleSemester)
		scheduleSemester = activeScheduleSemester;
	if(await isInSchedule(cid, localSchedule, scheduleSemester, scheduleNum))
		return true;
	localSchedule[scheduleSemester][scheduleNum].push(cid);
	await setLocalSchedule(localSchedule);
	return true;
}

async function removeFromSchedule(cid, localSchedule=null, scheduleSemester=null, scheduleNum=null) {
	if(!localSchedule) {
		try {
			localSchedule = await verifyScheduleIntegrity(localSchedule);
		} catch(e) {
			return null;
		}
	}
	if(!scheduleNum)
		scheduleNum = activeScheduleNum;
	if(!scheduleSemester)
		scheduleSemester = activeScheduleSemester;
	if(!(await isInSchedule(cid, localSchedule, scheduleSemester, scheduleNum)))
		return true;
	localSchedule[scheduleSemester][scheduleNum] = localSchedule[scheduleSemester][scheduleNum].filter(id => id != cid);
	await setLocalSchedule(localSchedule);
	return true;
}

async function switchInSchedule(cid, localSchedule=null, scheduleSemester=null, scheduleNum=null) {
	if(!localSchedule) {
		try {
			localSchedule = await verifyScheduleIntegrity(localSchedule);
		} catch(e) {
			return null;
		}
	}
	if(!scheduleNum)
		scheduleNum = activeScheduleNum;
	if(!scheduleSemester)
		scheduleSemester = activeScheduleSemester;
	if(await isInSchedule(cid, localSchedule))
		return removeFromSchedule(cid, localSchedule, scheduleSemester, scheduleNum);
	return addToSchedule(cid, localSchedule, scheduleSemester, scheduleNum);
}


//---------------------------//
//--- Table Action Events ---//
//---------------------------//
async function switchType(event) {
	let element = event.target;
	let row = element.parentElement.parentElement;

	let id = row.data.id;
	let has_child = (row.data.child_class != "null")
	try {
		var localSchedule = await getLocalSchedule();
	} catch(e) {
		console.error(e);
		return;
	}

	if(id) {
		await switchInSchedule(id, localSchedule)
		if(has_child) {
		 	let child_id = parseInt(row.data.child_class);
			await switchInSchedule(child_id, localSchedule)
		}
		updateAll();
	}
}

async function removeClass(event) {
	let element = event.target;
	let row = element.parentElement.parentElement;

	// make sure user wants to remove course, else return
	let confirm_str = `Are you sure you want to delete this course?\n${row.data.course_title.split(":")[0]} (Section ${row.data.course_section})`
	if (confirm(confirm_str) == false)
		return

	let id = row.data.id;
	let has_child = (row.data.child_class != "null");

	if(id) {
		let changes = JSON.parse(await MGH.makeRequest(
			MGH.serverURL+`/schedule/remove/`,
			{
				"classID": id
			},
			apiKey, uid
		))["changes"];
		
		if(!changes || parseInt(changes) <= 0) {
			console.log("Error removing class from schedule");
			return
		}

		try {
			var localSchedule = await getLocalSchedule();
		} catch(e) {
			console.error(e);
			return;
		}
		await removeFromSchedule(id, localSchedule)
		if(has_child) {
			let child_id = parseInt(row.data.child_class);
			await removeFromSchedule(child_id, localSchedule)
	   }
	   updateAll(true);
	}
}




//--------------------------//
//--- Utility Functions ----//
//--------------------------//

//--- Hot Keys ---//
document.onkeydown = async function(evt) {
	if(keybinds_enabled) {
		evt = evt || window.event;
		let key = evt.key || 0;

		let is_num = /^\d+$/.test(key)
		if(is_num) {
			let number = parseInt(key);
			if(number >= 0 && number <= 9) { 
				let newScheduleNum = String(number);
				await switchSchedule(newScheduleNum)
			}
		}
	}
};

export function enableKeybinds() {
	keybinds_enabled = true;
}

export function enableShowAllClasses() {
	showAllClasses = true;
}

export function getActiveScheduleNum() {
	return activeScheduleNum;
}
export function getActiveScheduleSemester() {
	return activeScheduleSemester;
}

function getParent(id, scheduleData) {
	for(let cls of scheduleData) {
		if(cls.child_class == id) {
			return cls;
		}
	}
}

function seededShuffle(array, seed) {
	const newArray = array.slice();
	for (let i = newArray.length - 1; i > 0; i--) {
		const random = lehmerRandom(seed);
		seed = Math.floor(random * 2147483647);
		const j = Math.floor(random * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

function lehmerRandom(seed) {
	const a = 16807;
	const m = 2147483647;
	seed = (seed * a) % m;
	return seed / m;
}

function jenkinsHash(str) { // slow but great randomness based on string seed
	let hash = random_seed;
	for (let i = 0; i < str.length; ++i) {
		hash += str.charCodeAt(i);
		hash += (hash << 10);
		hash ^= (hash >> 6);
	}
	hash += (hash << 3);
	hash ^= (hash >> 11);
	hash += (hash << 15);
	return hash >>> 0;
}

function str_pad_left(string, pad, length) {
	return (new Array(length + 1).join(pad) + string).slice(-length);
}

















//---------------------//
//--- Schedule List ---//
//---------------------//

export async function updateScheduleView(scheduleViewDiv, scheduleData=null, localSchedule=null) {
	if(!localSchedule) {
		try {
			localSchedule = await getLocalSchedule();
		} catch(e) {
			console.error(e);
			return;
		}
	}

	if(!scheduleData)
		scheduleData = await getScheduleData();

	let scheduleList = Object.keys(localSchedule[activeScheduleSemester]);
	scheduleViewDiv.innerHTML = "";

	for(let i=0; i<scheduleList.length; i++) {
		let scheduleNum = scheduleList[i];
		let scheduleName = `Schedule ${scheduleNum}`;

		let newButton = document.createElement("div");
		newButton.classList.add("switch-button");
		newButton.classList.add("schedule-item-button");
		newButton.onclick = () => switchSchedule(scheduleNum);

		if(scheduleNum == activeScheduleNum) {
			newButton.classList.add("switch-button-active");
			newButton.onclick = () => deleteSchedule(scheduleNum);
		}

		newButton.innerHTML = scheduleName;
		scheduleViewDiv.appendChild(newButton);
	}

	// + button
	let newButton = document.createElement("div");
	newButton.classList.add("switch-button");
	newButton.classList.add('add-schedule-button');
	newButton.innerHTML = "+";
	newButton.onclick = () => addSchedule();
	scheduleViewDiv.appendChild(newButton);

	// clone button
	let cloneButton = document.createElement("div");
	cloneButton.classList.add("switch-button");
	cloneButton.innerHTML = "Clone";
	cloneButton.onclick = () => cloneSchedule();
	scheduleViewDiv.appendChild(cloneButton);

	// generate.html link
	let generateButton = document.createElement("div");
	generateButton.classList.add("switch-button");
	generateButton.innerHTML = "Generate";
	generateButton.onclick = () => window.location = "generate.html";
	scheduleViewDiv.appendChild(generateButton);


	// semester switcher
	let select = document.createElement("select");
	select.classList.add("semester-switcher");

	let semesterList = [];
	for(let semester of Object.keys(localSchedule)) {
		if(!semester || semester == null)
			semester = "N/A"
		if(semesterList.includes(semester))
			continue
		semesterList.push(semester);
	}
	semesterList = sortSeasonYear(semesterList)
	for(let semester of semesterList) {
		let selected = false
		if(semester == activeScheduleSemester)
			selected = true

		select.options.add( new Option(semester, semester, selected, selected) );
	}

	select.onchange = () => switchSemester(select);
	scheduleViewDiv.appendChild(select);
}


//-----------------------------//
//--- Schedule View Updates ---//
//-----------------------------//
export function setUpdateAllCallback(callback) {
	updateAll = callback;
}

function switchSemester(select) {
	//let localSchedule = await getLocalSchedule();
	setActiveScheduleSemester(select.value);
	//if(!localSchedule[activeScheduleSemester] || !localSchedule[activeScheduleSemester][activeScheduleNum])
	setActiveScheduleNum("1");
	updateAll();
}

async function switchSchedule(scheduleNum) {
	// check if schedule exists
	try {
		var localSchedule = await getLocalSchedule();
	} catch(e) {
		console.error(e);
		return;
	}
	if(!localSchedule[activeScheduleSemester][scheduleNum])
		return;

	setActiveScheduleNum(scheduleNum);
	updateAll();
}

function getNewScheduleNum(scheduleList) {
	if(scheduleList.length == 0)
		return 1;
	let newScheduleNum = (parseInt(scheduleList[scheduleList.length-1])+1);
	return newScheduleNum;
}

async function addSchedule() {
	try {
		var localSchedule = await getLocalSchedule();
	} catch(e) {
		console.error(e);
		return;
	}
	let scheduleList = Object.keys(localSchedule[activeScheduleSemester]);
	let newScheduleNum = getNewScheduleNum(scheduleList);
	activeScheduleNum = newScheduleNum.toString();
	setActiveScheduleNum(activeScheduleNum);
	updateAll();
}

async function cloneSchedule() {
	try {
		var localSchedule = await getLocalSchedule();
	} catch(e) {
		console.error(e);
		return;
	}
	let scheduleList = Object.keys(localSchedule[activeScheduleSemester]);
	let newScheduleNum = getNewScheduleNum(scheduleList);
	localSchedule[activeScheduleSemester][newScheduleNum] = localSchedule[activeScheduleSemester][activeScheduleNum];

	setLocalSchedule(localSchedule);
	activeScheduleNum = newScheduleNum.toString();
	setActiveScheduleNum(activeScheduleNum);
	updateAll();
}

async function deleteSchedule(scheduleNum) {
	try {
		var localSchedule = await getLocalSchedule();
	} catch(e) {
		console.error(e);
		return;
	}
	// make sure user wants to delete schedule
	let confirm_str = `Are you sure you want to delete this schedule?\n(Schedule ${scheduleNum})`
	if (confirm(confirm_str) == false)
		return
	delete localSchedule[activeScheduleSemester][scheduleNum];
	setLocalSchedule(localSchedule);
	
	activeScheduleNum = "1";
	switchSchedule("1");
	updateAll();
}


//--------------------//
//--- Helper Funcs ---//
//--------------------//

const sortSeasonYear = (arr) => {
	return arr.sort((a, b) => {
		try {
			const aArr = a.split(' ');
			const bArr = b.split(' ');
			const aSeason = aArr[0];
			const bSeason = bArr[0];
			const aYear = aArr[1];
			const bYear = bArr[1];
			if (aYear !== bYear) {
				return aYear - bYear;
			} else {
				return seasons[aSeason] - seasons[bSeason];
			}
		} catch (e) {
			if(a == "N/A")
				return 1;
			if(b == "N/A")
				return -1;
			return 0;
		}
	}).reverse();
};