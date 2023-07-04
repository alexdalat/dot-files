

import * as MGH from "./MGH.js"


export async function setStorage(key, value){
	var setter = {}; 
	setter[key] = value;
    await chrome.storage.local.set(setter);
	return value
}

export async function getStorage(key){
	try {
    	return (await chrome.storage.local.get([key]))[key];
	} catch(e) {
		return "-1"
	}
}

export async function isValid(apiKey) {
	let uid = await getUid();
	let access = await MGH.makeRequest(MGH.serverURL+"/access/", {}, apiKey, uid)
	if(access == "-1" || access == "undefined") 
		return false
	access = JSON.parse(access)["access"]
	if(access != "1")
		return false
	return true

}

function makeid() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
	let length = 50;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
	return result
}

export async function getUid() {
	var uid = await getStorage("x-uid");
	if(uid == undefined || uid == "" || uid == "-1") {
		let newUid = makeid();
		await setStorage("x-uid", newUid);
		uid = await getStorage("x-uid");
	}
	return uid
}

export async function getKey() {
	return await getStorage("x-api-key");
}

export function studentsToColor(c) {
	if(c == "?") return "#FF0000";
	if(c == "??") return "#808080";
	return percToColor((c/4000)*100)
}

export function gpaToColor(gpa) {
	if(gpa == -1) return "#000000";
	if(gpa == "?") return "#FF0000";
	if(gpa == "??") return "#808080";
	let perc = (gpa-2) / 2 * 100
	return percToColor(perc)
}

export function percToColor(perc) {
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


export function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}