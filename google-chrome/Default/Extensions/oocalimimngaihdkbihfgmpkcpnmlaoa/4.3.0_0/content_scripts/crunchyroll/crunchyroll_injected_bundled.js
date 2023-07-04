/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/Teleparty/Enums/PlaybackState.ts
var PlaybackState;
(function (PlaybackState) {
    PlaybackState["LOADING"] = "loading";
    PlaybackState["PLAYING"] = "playing";
    PlaybackState["IDLE"] = "idle";
    PlaybackState["AD_PLAYING"] = "ad_playing";
    PlaybackState["PAUSED"] = "paused";
    PlaybackState["NOT_READY"] = "not_ready";
})(PlaybackState || (PlaybackState = {}));

;// CONCATENATED MODULE: ./src/Teleparty/ContentScripts/Crunchyroll/crunchyroll_injected.js

if (!window.videoIdScriptLoaded && window != top && !!document.querySelector('#player0')) {
    console.log("Crunchyroll script loaded");
    //Settings/Playback Control Variables
    let buttonViewTimeout;
    let CRUNCHYROLL_CONTROLS_TIMEOUT = 1500;
    const settingsObserver = new MutationObserver((mutationRecords) => {
        for (const mutation of mutationRecords) {
            if (mutation.type === 'childList') {
                const settingsMenu = document.getElementById('velocity-settings-menu');
                const pageControlVisible = !!document.querySelector('[data-testid=vilos-play_pause_button]');
                const middleContainer = document.querySelector('[data-testid=middleBarContainer]');
                if (middleContainer) {
                    middleContainer.style.display = 'none';
                }
                if (settingsMenu) {
                    settingsMenu.style.zIndex = '9999';
                }
                if (pageControlVisible) {
                    if (buttonViewTimeout) {
                        clearTimeout(buttonViewTimeout);
                    }
                    _relayMessage({ type: 'alterPageControls', menuVisible: true });
                }
                else {
                    if (buttonViewTimeout) {
                        clearTimeout(buttonViewTimeout);
                    }
                    buttonViewTimeout = setTimeout(() => {
                        _relayMessage({ type: 'alterPageControls', menuVisible: false });
                    }, CRUNCHYROLL_CONTROLS_TIMEOUT);
                }
            }
        }
    });
    //Ad Control Variables
    let _checkForAds;
    window.videoIdScriptLoaded = true;
    window.addEventListener("message", function (evt) {
        var eventExists = evt.data.infoSending;
        if (eventExists) {
            var type = eventExists.type;
        }
        else {
            return;
        }
        if (type === 'getVideoData') {
            const videoInfo = getCurrentVideoInformation();
            if (videoInfo) {
                const newEvent = { type: 'VideoData', videoData: videoInfo };
                _relayMessage(newEvent);
            }
        }
        if (type === 'playVideo') {
            document.querySelector('#player0').play();
        }
        if (type === 'pauseVideo') {
            document.querySelector('#player0').pause();
        }
        if (type === 'updateState') {
            const playerstate = {
                //time: getMediaProp().contentTime * 1000,
                time: document.querySelector('video').currentTime * 1000,
                playbackState: _getPlaybackState(),
            };
            const newEvent = { type: 'updatedState', playerState: playerstate };
            _relayMessage(newEvent);
        }
        if (type === 'seekTo') {
            getProp().playerActions.requestSeekToContentTime(evt.data.infoSending.eventData.time / 1000);
        }
        if (type === 'jumpToNext') {
            jumpToNext();
        }
        if (type === 'startListeningVideo') {
            _checkForAds = setInterval(() => {
                _checkAdStart();
            }, 2000);
            const video = document.querySelector('#player0');
            document.getElementById('velocity-player-package').style.position = 'fixed';
            document.getElementById('velocity-controls-package').style.position = 'fixed';
            let targetSettings = document.getElementById('velocity-controls-package');
            //settingsObserver.observe(targetSettings, { attributes: true, childList: true, subtree: true })
            if (video) {
                video.addEventListener("loadstart", () => { _relayMessage({ type: 'videoLoadStart' }); });
                video.addEventListener("play", () => { _relayMessage({ type: 'onUserInteraction' }); });
                video.addEventListener("pause", () => { _relayMessage({ type: 'onUserInteraction' }); });
            }
            window.addEventListener("mouseup", (e) => { _onClick(e); });
            window.addEventListener("keyup", (e) => { _onPress(e); });
            document.addEventListener('fullscreenchange', () => { _onFullScreen(); });
            document.querySelector('#vilosRoot').webkitRequestFullscreen = function () {
                _relayMessage({ type: 'onFullscreen' });
            };
            document.querySelector('#vilosRoot').msRequestFullscreen = function () {
                _relayMessage({ type: 'onFullscreen' });
            };
            document.querySelector('#vilosRoot').requestFullscreen = function () {
                _relayMessage({ type: 'onFullscreen' });
            };
        }
        if (type === 'stopListeningVideo') {
            settingsObserver.disconnect();
            document.getElementById('velocity-player-package').style.position = '';
            document.getElementById('velocity-controls-package').style.position = '';
            const video = document.querySelector('#player0');
            if (video) {
                video.removeEventListener("loadstart", () => { _relayMessage({ type: 'videoLoadStart' }); });
                video.removeEventListener("play", () => { _relayMessage({ type: 'onUserInteraction' }); });
                video.removeEventListener("pause", () => { _relayMessage({ type: 'onUserInteraction' }); });
            }
            window.removeEventListener("mouseup", (e) => { _onClick(e); });
            window.removeEventListener("keyup", (e) => { _onPress(e); });
            document.removeEventListener('fullscreenchange', () => { _onFullScreen(); });
            if (_checkForAds) {
                clearInterval(_checkForAds);
            }
            if (buttonViewTimeout) {
                clearTimeout(buttonViewTimeout);
            }
        }
    });
    var _checkAdStart = function () {
        const currentlyInAd = getInAd();
        if (currentlyInAd == false) {
            _relayMessage({ type: 'onAdEnd' });
        }
        else {
            _relayMessage({ type: 'onAdStart' });
        }
    };
    var _onFullScreen = function () {
        _relayMessage({ type: 'onFullscreen' });
        if (document.fullscreenElement) {
            //document.exitFullscreen()
        }
    };
    var _onClick = function () {
        _relayMessage({ type: 'onUserInteraction' });
    };
    var _onPress = function (event) {
        _relayMessage({ type: 'onUserInteraction' });
        if (event.key == "Escape") {
            _relayMessage({ type: 'exitFullscreen' });
        }
    };
    var _relayMessage = function (messageObj) {
        top.postMessage(messageObj, '*');
    };
    var _getPlaybackState = function () {
        const video = document.querySelector('#player0');
        if (video == undefined) {
            return PlaybackState.NOT_READY;
        }
        else if (video.readyState < 4) {
            return PlaybackState.LOADING;
        }
        else if (video.paused) {
            return PlaybackState.PAUSED;
        }
        else {
            return PlaybackState.PLAYING;
        }
    };
    var getInAd = function () {
        try {
            const elementRoot = document.querySelector('#player0');
            if (elementRoot == null) {
                return null;
            }
            const keys = Object.keys(elementRoot);
            let key = null;
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].startsWith('__reactInternal')) {
                    key = keys[i];
                    break;
                }
            }
            const isInAd = elementRoot[key].return.stateNode.props.isInAdBreak;
            return isInAd;
        }
        catch (err) {
            console.log(err);
            return undefined;
        }
    };
    var getProp = function () {
        const elementRoot = document.querySelector('#player0');
        if (elementRoot == null) {
            return null;
        }
        const keys = Object.keys(elementRoot);
        let key = null;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].startsWith('__reactInternal')) {
                key = keys[i];
                break;
            }
        }
        return elementRoot[key].return.stateNode.props;
    };
    var jumpToNext = function () {
        const props = getProp();
        props.playerActions.ended();
    };
    var getCurrentVideoInformation = function () {
        try {
            const elementRoot = document.querySelector('#player0');
            if (elementRoot == null) {
                return null;
            }
            const keys = Object.keys(elementRoot);
            let key = null;
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].startsWith('__reactInternal')) {
                    key = keys[i];
                    break;
                }
            }
            const section_path = elementRoot[key].return.stateNode.props.configuration.metadata;
            if (key == null || typeof elementRoot[key] === 'undefined' || typeof section_path === 'undefined') {
                return null;
            }
            var VideoInformationObject = {
                episodeNumber: section_path.sequenceNumber,
                videoTitle: section_path.title,
                videoType: section_path.type,
                videoId: section_path.id,
                seriesId: section_path.seriesId,
                duration: document.querySelector('video').duration
                //duration: getMediaProp().contentDuration
            };
            return VideoInformationObject;
        }
        catch (err) {
            console.log(err);
            return undefined;
        }
    };
}
else {
    console.log("Didn't inject");
}

/******/ })()
;