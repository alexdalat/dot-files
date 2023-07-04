

import * as util from '../util.js'
import * as scheduleLib from './scheduleLib.js'
import * as generator from './generator.js'


//-----------------//
//--- Variables ---//
//-----------------//

// Data Cache Storage
var storedScheduleData = null;

// Global Variables
var activeScheduleSemester = "N/A";
var activeScheduleNum = "1";

// Parameters
let minCredits = 14;
let maxCredits = 18;
let minTime = scheduleLib.convertToMinutes(8, 0, "AM");
let maxTime = scheduleLib.convertToMinutes(5, 0, "PM");

// HTML Elements
const current_schedule = document.getElementById('current-schedule');
const generator_list = document.getElementById('generator-list');

const generatedSchedulesCount = document.getElementById('generated-schedules-count');

const back_button = document.getElementById('back-button');

// Parameter Inputs
const minCreditsInput = document.getElementById('minCredits');
const minCreditsIndicator = document.getElementById('minCreditsIndicator');
const maxCreditsInput = document.getElementById('maxCredits');
const maxCreditsIndicator = document.getElementById('maxCreditsIndicator');

const minTimeInput = document.getElementById('minTime');
const maxTimeInput = document.getElementById('maxTime');



//------------//
//--- Main ---//
//------------//

function main() {
	activeScheduleSemester = localStorage["lastScheduleSemester"] || "N/A";
	activeScheduleNum = localStorage["lastScheduleNum"] || "1";
	scheduleLib.setActiveScheduleSemester(activeScheduleSemester);
	scheduleLib.setActiveScheduleNum(activeScheduleNum);

	scheduleLib.setUpdateAllCallback(updateAll);

	// set parameter inputs to defaults or restore last used
	minCredits = localStorage["genMinCredits"] || minCredits;
	maxCredits = localStorage["genMaxCredits"] || maxCredits;
	minTime = localStorage["genMinTime"] || minTime;
	maxTime = localStorage["genMaxTime"] || maxTime;

	minCreditsInput.value = minCredits;
	maxCreditsInput.value = maxCredits;
	minCreditsIndicator.innerHTML = minCredits;
	maxCreditsIndicator.innerHTML = maxCredits;

	let [minhrs, minmins, minmeridiem] = scheduleLib.convertToString(minTime);
	minTimeInput.value = (minmeridiem == "PM" ? parseInt(minhrs) + 12 : minhrs) + ":" + minmins;
	let [maxhrs, maxmins, maxmeridiem] = scheduleLib.convertToString(maxTime);
	maxTimeInput.value = (maxmeridiem == "PM" ? parseInt(maxhrs) + 12 : maxhrs) + ":" + maxmins;

	updateAll(true);
}
main();





//--------------------//
//--- Main Updates ---//
//--------------------//
async function updateAll(renew_data = false) {
	
	// check if user is logged in
	let apiKey = await util.getKey();
	if(!(await util.isValid(apiKey))) return

	// get schedule data
	let scheduleData;
	if(renew_data || !storedScheduleData) {
		scheduleData = await scheduleLib.getScheduleData();
		storedScheduleData = scheduleData;
	} else
		scheduleData = storedScheduleData;

	let localSchedule;
	try {
		localSchedule = await scheduleLib.getLocalSchedule();
	} catch(e) {
		console.log(e);
		return
	}

	// clear any previous generations
	generator_list.innerHTML = "";
	current_schedule.innerHTML = "";

	// prepare color and data
	scheduleLib.fillColorData(scheduleData);
	scheduleData = scheduleData.filter(cls => cls.semester == scheduleLib.getActiveScheduleSemester());
	scheduleLib.enableShowAllClasses();

	// generator parameters
	let scheduleCount = 100;
	let mustTake = [];
	mustTake = localSchedule[scheduleLib.getActiveScheduleSemester()][scheduleLib.getActiveScheduleNum()]

	generator.randomOrder(true);
	generator.includeAlreadySavedSchedules(false);
	const includeList = true;


	// show current schedule
	let current_tables = generateHTMLStructures(current_schedule, null, false);
	current_tables.newRow.style.padding = "20px 0px 10px 0px";

	let currentScheduleData = scheduleData.filter(cls => mustTake.includes(cls.id));
	let currentTimeData = scheduleLib.prepareTimeData(currentScheduleData);

	scheduleLib.updateWeeklyView(current_tables.weeklyTable.body, scheduleData, currentTimeData, localSchedule, false, 4);
	scheduleLib.updateTableView(current_tables.scheduleTable.body, false, scheduleData, currentTimeData, localSchedule, true);



	// generate schedules
	let generatedSchedules = generator.sampleSchedules(scheduleData, mustTake, minTime, maxTime, minCredits, maxCredits, scheduleCount, localSchedule);

	// show generated schedules
	generatedSchedulesCount.innerHTML = generatedSchedules.length;
	for(let i = 0; i < generatedSchedules.length; i++) {

		let tables = generateHTMLStructures(generator_list, i, true, includeList);

		// prepare data
		let localScheduleImitator = generator.imitateSchedule(generatedSchedules[i]);
		let lscheduleData = scheduleData.filter(cls => scheduleLib.isInSchedule(cls.id, localScheduleImitator));
		let ltimeData = scheduleLib.prepareTimeData(lscheduleData);

		
		// update all views
		scheduleLib.updateWeeklyView(tables.weeklyTable.body, lscheduleData, ltimeData, localScheduleImitator, false, 4);
		if(includeList)
			scheduleLib.updateTableView(tables.scheduleTable.body, false, lscheduleData, ltimeData, localScheduleImitator, false);
			

		// bind button
		tables.button.addEventListener('click', () => {
			// scheduleLib.addToSchedule(); // sets activeScheduleNumber to new schedule
			localSchedule[scheduleLib.getActiveScheduleSemester()][scheduleLib.getActiveScheduleNum()] = generatedSchedules[i];
			scheduleLib.setLocalSchedule(localSchedule);
			window.location.href = "/schedule/schedule.html";
		});
	}
} 


//------------------------//
//--- Helper Functions ---//
//------------------------//
function generateHTMLStructures(targetDiv, i, add_button=true, includeList=true) {
  
	const newDiv = document.createElement("div");
	newDiv.classList.add("row");

	if(i != null)
		newDiv.innerHTML = `
			<h3>
				${i+1}
			</h3>`;
		
	newDiv.innerHTML += `
		<div class="col">
		  <table class="weeklyTable">
			<thead>
			  <tr>
				<th>Time</th>
				<th>Monday</th>
				<th>Tuesday</th>
				<th>Wednesday</th>
				<th>Thursday</th>
				<th>Friday</th>
				<th>Saturday</th>
			  </tr>
			</thead>
			<tbody>
			</tbody>
		  </table>
		</div>`;

	if(includeList) {
		newDiv.innerHTML += `
			<div class="col">
				<table class="listTable">
					<thead>
					<tr>
						<th>Title</th>
						<th>Sect</th>
						<th>Cr</th>
						<th>#</th>
						<th>Professor</th>
						<th>Time</th>
						<th></th>
						<th></th>
					</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		`;
	}

	let button = null;
	if(add_button) {
		button = document.createElement("button");
		button.classList.add("submit-button");
		button.style.padding = "10px 10px";
		button.style.fontSize = "20px"
		button.innerHTML = "<b>+</b>";
		newDiv.appendChild(button);
	}

	targetDiv.appendChild(newDiv);
	if(add_button) {
		let hr = document.createElement("hr");
		hr.classList.add("col");
		targetDiv.appendChild(hr);
	}
  
	const weeklyTableBody = newDiv.querySelector(".weeklyTable tbody");
	const weeklyTableHead = newDiv.querySelector(".weeklyTable thead tr");
	if(includeList)
		var scheduleTableBody = newDiv.querySelector(".listTable tbody");
  
	return { 
		weeklyTable: {head: weeklyTableHead, body: weeklyTableBody}, 
		scheduleTable: {body: scheduleTableBody},
		newRow: newDiv,
		button: button
	};
}

//--------------------//
//--- HTML Updates ---//
//--------------------//
back_button.addEventListener('click', () => {
	window.location.href = "/schedule/schedule.html";
});

minCreditsInput.addEventListener('change', () => {
	minCredits = minCreditsInput.value;
	minCreditsIndicator.innerHTML = minCredits;
	maxCreditsInput.min = minCredits;
	localStorage.setItem("genMinCredits", minCredits);
	updateAll();
});
minCreditsInput.oninput = () => {
	minCreditsIndicator.innerHTML = minCreditsInput.value;
}
maxCreditsInput.addEventListener('change', () => {
	maxCredits = maxCreditsInput.value;
	maxCreditsIndicator.innerHTML = maxCredits;
	minCreditsInput.max = maxCredits;
	localStorage.setItem("genMaxCredits", maxCredits);
	updateAll();
});
maxCreditsInput.oninput = () => {
	maxCreditsIndicator.innerHTML = maxCreditsInput.value;
}

minTimeInput.addEventListener('change', () => {
	try {
		var [h, m] = minTimeInput.value.split(":");
		h = parseInt(h); m = parseInt(m);
		let hrs = (h % 12 ? h % 12 : 12) 
		let mins = m;
		let meridiem = h >= 12 ? 'PM' : 'AM';
		minTime = scheduleLib.convertToMinutes(hrs, mins, meridiem);
		localStorage.setItem("genMinTime", minTime);
	} catch(e) {
		console.log("Failed to convert time to minutes.");
	}
	updateAll();
});
maxTimeInput.addEventListener('change', () => {
	try {
		var [h, m] = maxTimeInput.value.split(":");
		h = parseInt(h); m = parseInt(m);
		let hrs = (h % 12 ? h % 12 : 12) 
		let mins = m;
		let meridiem = h >= 12 ? 'PM' : 'AM';
		maxTime = scheduleLib.convertToMinutes(hrs, mins, meridiem);
		localStorage.setItem("genMaxTime", maxTime);
	} catch(e) {
		console.log("Failed to convert time to minutes.");
		return
	}
	updateAll();
});