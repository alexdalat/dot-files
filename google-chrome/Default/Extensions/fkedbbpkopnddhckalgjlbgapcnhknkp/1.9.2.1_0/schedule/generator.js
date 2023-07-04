

import * as scheduleLib from './scheduleLib.js'

let useRandomOrder = true;
let useAlreadySavedSchedules = true;

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

function getTotalCredits(schedules) {
	return schedules.reduce((total, schedule) => total + schedule.credits, 0);
}

function hasSameClassCode(selectedSchedules, currentSchedule) {
	const currentClassCode = currentSchedule.course_title.split(':')[0];
	return selectedSchedules.some(schedule => 
		schedule.course_title.split(':')[0].startsWith(currentClassCode)
		|| currentClassCode.startsWith(schedule.course_title.split(':')[0])
	);
}

export function sampleSchedules(scheduleData, mustTake, minStartTime, maxEndTime, minTotalCredits, maxTotalCredits, numSamples, localSchedulee=null) {
	let result = [];
	let localSchedule = localSchedulee;

	function findScheduleBy(id, param="id") {
		return scheduleData.find(schedule => schedule[param] == id);
	}

	function checkConflicts(selectedSchedules, currentSchedule) {
		const currentRange = scheduleLib.getTimeRangeInMinutes(currentSchedule.time);
		if (currentRange === -1) {
		  	return false; // async class
		}
		const [currentDays, currentStartTime, currentEndTime] = currentRange;
		if (currentStartTime < minStartTime || currentEndTime > maxEndTime) {
		  	return true; // outside of time range, conflict
		}
		
		let timeData = scheduleLib.prepareTimeData(selectedSchedules);
		if(scheduleLib.checkForConflicts(currentSchedule, timeData))
			return true;
		return false;
	} // end checkConflicts
  
	function findCombinations(selectedSchedules, index) {
		if (result.length >= numSamples) { // already found enough samples
			return;
		}
		if (index >= scheduleData.length) { // reached the end of the schedule data

			// test if schedule is already in localSchedule
			if (localSchedule && !useAlreadySavedSchedules) {
				const localScheduleSemester = localSchedule[scheduleLib.getActiveScheduleSemester()];
				let compareSchedule = selectedSchedules.map(schedule => schedule.id);
				compareSchedule.sort();
				if (localScheduleSemester) {
					const localScheduleSemesterArr = Object.values(localScheduleSemester);
					if(localScheduleSemesterArr.some(schedule => {
						schedule = [...schedule].sort();
						return compareSchedule.equals(schedule);
					})) {
						return; // exclude
					}
				}
			}

			const totalCredits = getTotalCredits(selectedSchedules);
			if(useRandomOrder) {
				if (totalCredits >= minTotalCredits && totalCredits <= maxTotalCredits) {
					if (Math.random() < (numSamples / (numSamples + result.length))) {
						const randomIndex = getRandomInt(0, result.length + 1);
						result.splice(randomIndex, 0, selectedSchedules.map(schedule => schedule.id));
						if (result.length > numSamples) {
							result.pop();
						}
					}
				}
			} else {
				const totalCredits = getTotalCredits(selectedSchedules);
				if (totalCredits >= minTotalCredits && totalCredits <= maxTotalCredits) {
					result.push(selectedSchedules.map(schedule => schedule.id));
				}
			} 
			return;
		}
		const currentSchedule = scheduleData[index];
		// if the class code is not the same as any of the current schedule and is a parent course or has no child
		if (!hasSameClassCode(selectedSchedules, currentSchedule) && currentSchedule.is_child != "true") {
				const childId = currentSchedule.child_class;
				const childSchedule = findScheduleBy(childId, "id");
				if (childSchedule) {
					if (!checkConflicts(selectedSchedules, currentSchedule) 
					  && !checkConflicts(selectedSchedules, childSchedule) 
					  && getTotalCredits(selectedSchedules) + childSchedule.credits + currentSchedule.credits <= maxTotalCredits) {
						findCombinations([...selectedSchedules, currentSchedule, childSchedule], index + 1);
					}
				} else {
					if (getTotalCredits(selectedSchedules) + currentSchedule.credits <= maxTotalCredits 
					  && !checkConflicts(selectedSchedules, currentSchedule)) {
						findCombinations([...selectedSchedules, currentSchedule], index + 1);
					}
				}
		}
	  	findCombinations(selectedSchedules, index + 1);
	} // end of findCombinations

	let mustTakeCourses = mustTake.map(id => findScheduleBy(id, "id")) || [];
	mustTakeCourses = mustTakeCourses.filter(course => course != null);
  
	findCombinations(mustTakeCourses, 0);
	return result;
} // end of sampleSchedules




export function randomOrder(state) {
	useRandomOrder = state;
}
export function includeAlreadySavedSchedules(state) {
	useAlreadySavedSchedules = state;
}


export function imitateSchedule(arr) {
	let localScheduleImitator = {};
	localScheduleImitator[scheduleLib.getActiveScheduleSemester()] = {};
	localScheduleImitator[scheduleLib.getActiveScheduleSemester()][scheduleLib.getActiveScheduleNum()] = arr;
	return localScheduleImitator;
}



Array.prototype.equals = function( array ) {
	return this.length == array.length && 
		   this.every( function(this_i,i) { return this_i == array[i] } )  
}