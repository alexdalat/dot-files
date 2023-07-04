
//-----------------//
//--- Variables ---//
//-----------------//

// HTML Elements
const scheduleListDiv = document.getElementById('schedule-list-items');
const semesterDiv = document.getElementById('semesterDiv');

const scheduleTableBody = document.getElementById('scheduleTableBody');
const bookmarkTableBody = document.getElementById('bookmarkTableBody');

const weeklyTableBody = document.getElementById('weeklyTableBody');


// Data Cache Storage
var storedScheduleData = null;

// Global Variables
var activeScheduleSemester = "N/A";
var activeScheduleNum = "1";


import * as util from '../util.js'
import * as scheduleLib from './scheduleLib.js'


//------------//
//--- Main ---//
//------------//

function main() {
	activeScheduleSemester = localStorage["lastScheduleSemester"] || "N/A";
	activeScheduleNum = localStorage["lastScheduleNum"] || "1";
	scheduleLib.setActiveScheduleSemester(activeScheduleSemester);
	scheduleLib.setActiveScheduleNum(activeScheduleNum);

	// set updateAll callback for scheduleView
	scheduleLib.setUpdateAllCallback(updateAll);

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

	try {
		var localSchedule = await scheduleLib.getLocalSchedule();
	} catch(e) {
		console.error(e)
		return
	}
	if(localStorage["schedule"] != undefined) { // update from local storage to db storage
		await scheduleLib.setLocalSchedule(JSON.parse(localStorage["schedule"]));
		console.log("Updated local storage to online db storage.")
		delete localStorage["schedule"];
	}

	// verify schedule integrity
	localSchedule = await scheduleLib.verifyScheduleIntegrity(localSchedule, scheduleData);
	localSchedule = await scheduleLib.updateOldScheduleFormat(localSchedule);
	localSchedule = await scheduleLib.removeEmptySemesters(localSchedule, scheduleData); // if no class is in a semester, remove it
	console.log(localSchedule)

	scheduleLib.enableKeybinds();

	// prepare time and color data
	let scheduleTimeData = scheduleData.filter(cls => scheduleLib.isInSchedule(cls.id, localSchedule));
	let timeData = scheduleLib.prepareTimeData(scheduleTimeData);
	scheduleLib.fillColorData(scheduleData);

	// update all views
	scheduleLib.updateScheduleView(scheduleListDiv, scheduleData, localSchedule);
	scheduleLib.updateWeeklyView(weeklyTableBody, scheduleData, timeData, localSchedule);
	scheduleLib.updateTableView(bookmarkTableBody, true, scheduleData, timeData, localSchedule);
	scheduleLib.updateTableView(scheduleTableBody, false, scheduleData, timeData, localSchedule);
}