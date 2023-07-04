/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

var _a;
const signinURL = 'https://play.hbomax.com/signIn';
const profileURL = 'https://play.hbomax.com/profile/select';
let targetOrigin = '';
function getCallbackFunction(event) {
    return (message) => {
        var _a, _b;
        const data = event.data;
        if (data.callbackId) {
            const callbackId = event.data.callbackId;
            const returnMessage = {
                callbackId: callbackId,
                data: message
            };
            (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage(returnMessage, event.origin);
        }
        else {
            (_b = window.top) === null || _b === void 0 ? void 0 : _b.postMessage(message, event.origin);
        }
        targetOrigin = event.origin;
    };
}
function isValidOrigin(event) {
    if (true) {
        return prodOriginCheck(event);
    }
    else {}
}
function prodOriginCheck(event) {
    const match = event.origin.match(/^https:\/\/[^.]*\.(?:(?:tele\.pe)|(?:teleparty\.com)|(?:netflixparty\.com))$/);
    return match != null;
}
function handleMessage(event) {
    if (isValidOrigin(event)) {
        const message = event.data;
        if (message) {
            const callback = getCallbackFunction(event);
            if (message.type == "getProfileID") {
                callback(window.localStorage.getItem('currentProfileId'));
            }
            else if (message.type == "getHBOUrl") {
                setTimeout(() => {
                    if (window.location.href.includes(profileURL)) {
                        callback(profileURL);
                    }
                    else if (window.location.href.includes('.hbomax.')) {
                        callback(signinURL);
                    }
                }, 1000);
            }
            else {
                callback({ error: "Unsupported Operation" });
            }
        }
    }
}
// HBO Max Injections
if (window != top && !window.injectedScript && window.location.host.includes('play.hbomax.')) {
    window.injectedScript = true;
    console.log("INJECTED");
    (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage({ type: 'contentScriptInjected' }, '*');
    let foundProfile = window.localStorage.getItem('currentProfileId');
    window.addEventListener("message", handleMessage, false);
    window.addEventListener("storage", () => {
        var _a;
        if (window.localStorage.getItem('currentProfileId') && !foundProfile) {
            (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage({ type: 'hboConfirmed', profile: window.localStorage.getItem('currentProfileId') }, targetOrigin);
            foundProfile = window.localStorage.getItem('currentProfileId');
        }
    }, false);
}

/******/ })()
;