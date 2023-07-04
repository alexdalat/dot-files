/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

if (!window.videoIdScriptLoaded) {
    console.log("videoID Script Loaded");
    window.videoIdScriptLoaded = true;
    window.addEventListener('MaxVideoMessage', function (event) {
        if (event.detail) {
            var type = event.detail.type;
            console.log("Type is", type);
            if (type === 'getAdList') {
                console.log("gettingAdList");
                const adList = getAllAds();
                console.log(adList);
                const titleEvent = new CustomEvent('FromNode', { detail: { type: 'getAd', adList } });
                window.dispatchEvent(titleEvent);
            }
        }
    });
}
const findReactProps = function () {
    const elementRoot = document.querySelector('#overlay-root');
    if (elementRoot == null) {
        return null;
    }
    const keys = Object.keys(elementRoot);
    let key = null;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith('__reactFiber')) {
            key = keys[i];
            break;
        }
    }
    if (key == null) {
        return null;
    }
    if (typeof elementRoot[key] === 'undefined') {
        return null;
    }
    return elementRoot[key].return.pendingProps.playerCallbacks.mediator._playerControls._playbackEngineAdapter._playbackEngine._player._playerStateTracker._session._variantSelector._forecaster._bufferStabilityAnalyzer._buffer._periods;
};
const getAllAds = () => {
    let adElem = findReactProps();
    let positions = [];
    if (!adElem) {
        return [];
    }
    adElem === null || adElem === void 0 ? void 0 : adElem.forEach((a) => {
        a.video.forEach((b) => {
            var _a;
            let segm = (_a = b.getCachedDetails()) === null || _a === void 0 ? void 0 : _a.segments;
            if (segm) {
                positions.push([segm[0].start * 1000, segm[segm.length - 1].end * 1000]);
            }
        });
    });
    // Remove duplicates
    let uniquePositions = Array.from(new Set(positions.map(JSON.stringify)), JSON.parse);
    // Convert to an array of objects with startTime and duration properties
    let finalPositions = uniquePositions.map((position) => ({
        adStartTime: position[0],
        adDuration: position[1] - position[0]
    }));
    let filteredPositions = finalPositions.filter((position) => position.adDuration <= (100000));
    return filteredPositions;
};

/******/ })()
;