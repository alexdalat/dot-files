/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

window.seekScriptLoaded = true;
var findReactProps = function () {
    const elementRoot = document.querySelector('main#section_index > div');
    if (elementRoot == null) {
        return null;
    }
    const keys = Object.keys(elementRoot);
    let key = null;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith('__reactInternalInstance')) {
            key = keys[i];
            break;
        }
    }
    if (key == null) {
        return null;
    }
    if (typeof elementRoot[key] === 'undefined' || typeof elementRoot[key].memoizedProps.children._owner === 'undefined') {
        return null;
    }
    return elementRoot[key].memoizedProps.children._owner.memoizedProps;
};
var seekInteraction = function (e) {
    if (e.source == window) {
        if (e.data.type && "NEXT_EPISODE" == e.data.type) {
            const reactProps = findReactProps();
            reactProps.navigate({
                name: 'video',
                params: {
                    contentId: e.data.videoId,
                    timerAutoAdvanced: !0
                }
            });
        }
        if (e.data.type && "teardown" == e.data.type) {
            console.log("teardown");
            window.removeEventListener("message", seekInteraction, !1);
            window.seekScriptLoaded = false;
        }
    }
};
console.log("setup");
window.addEventListener("message", seekInteraction, false);

/******/ })()
;