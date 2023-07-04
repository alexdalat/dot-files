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

;// CONCATENATED MODULE: ./src/Teleparty/ContentScripts/VideoApi/GlobalVideoType.ts
var GlobalVideoType;
(function (GlobalVideoType) {
    GlobalVideoType["EPISODE"] = "episode";
    GlobalVideoType["FEATURE"] = "feature";
    GlobalVideoType["LIVE"] = "live";
    GlobalVideoType["EXTRA"] = "extra";
    GlobalVideoType["EVENT"] = "event";
    GlobalVideoType["OTHER"] = "other";
})(GlobalVideoType || (GlobalVideoType = {}));

;// CONCATENATED MODULE: ./src/Teleparty/ContentScripts/Espn/espn_injected.js


var _relayMessage = function (messageObj) {
    console.log("Sent: " + messageObj);
    top.postMessage(messageObj, '*');
};
var jumpToNext = function () {
    console.log("Implement next episode");
};
var _getPlaybackState = function () {
    const video = getPlayer();
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
var _onFullScreen = function () {
    console.log("Relaying fullscreen message");
    _relayMessage({ type: 'onFullscreen' });
};
var getPlayer = function () {
    return document.querySelector('video');
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
var getCurrentVideoInformation = function () {
    try {
        const section_path = window.espn.video._player._playerExtension._savedInitOptions;
        let streamType = section_path.mediaItem.streamType;
        let vidTitle = section_path.customProps.pageApiMeta.name;
        let epNum = undefined;
        if (streamType === 'live') {
            streamType = GlobalVideoType.LIVE;
        }
        else {
            let epNumTest = vidTitle.match(/\(Ep\.\s(\d+)/);
            if (epNumTest) {
                streamType = GlobalVideoType.EPISODE;
                epNum = epNumTest[1];
            }
            else {
                streamType = GlobalVideoType.FEATURE;
            }
            let vidTitleTest = vidTitle.match(/.+?(?=\()/);
            if (vidTitleTest) {
                vidTitle = vidTitleTest[0].trim();
            }
        }
        var VideoInformationObject = {
            episodeNumber: Number(epNum),
            videoTitle: vidTitle,
            videoType: streamType,
            videoId: section_path.id,
            seriesId: section_path.seriesId
        };
        return VideoInformationObject;
    }
    catch (err) {
        console.log("ERROR GETTING VIDEO DATA", err);
        return undefined;
    }
};
if (window == top && !window.topScriptLoaded) {
    window.topScriptLoaded = true;
    console.log("TOP SCRIPT LOADED");
    window.addEventListener("message", function (evt) {
        var eventExists = evt.data.infoSending;
        if (eventExists) {
            var type = eventExists.type;
            if (type === 'getVideoData') {
                const videoInfo = getCurrentVideoInformation();
                if (videoInfo) {
                    const newEvent = { type: 'VideoData', videoData: videoInfo };
                    _relayMessage(newEvent);
                }
            }
            if (type === 'startListeningVideo') {
                console.log("Start listening received");
                let fullscreenDomTarget = '#vjs_video_3';
                document.querySelector(fullscreenDomTarget).webkitRequestFullscreen = function () {
                    _relayMessage({ type: 'onFullscreen' });
                };
                document.querySelector(fullscreenDomTarget).msRequestFullscreen = function () {
                    _relayMessage({ type: 'onFullscreen' });
                };
                document.querySelector(fullscreenDomTarget).requestFullscreen = function () {
                    _relayMessage({ type: 'onFullscreen' });
                };
            }
        }
    });
}
if (window != top && !window.videoIdScriptLoaded && window.location.href.includes('plus.espn.')) {
    console.log("INJECTING SCRIPT", window.location.href);
    window.videoIdScriptLoaded = true;
    let buttonViewTimeout;
    let ESPN_CONTROLS_TIMEOUT = 1500;
    const settingsObserver = new MutationObserver((mutationRecords) => {
        for (const mutation of mutationRecords) {
            if (mutation.type === 'childList') {
                const pageControlVisible = !!document.querySelector('.progress-bar-container');
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
                    }, ESPN_CONTROLS_TIMEOUT);
                }
            }
        }
    });
    const videoObserver = new MutationObserver((mutationRecords) => {
        for (const mutation of mutationRecords) {
            if (mutation.type === 'childList') {
                console.log("Video has changed sources");
            }
        }
    });
    window.addEventListener("message", function (evt) {
        var eventExists = evt.data.infoSending;
        if (eventExists) {
            var type = eventExists.type;
            // if(type === 'getVideoData'){
            //     const videoInfo = getCurrentVideoInformation();
            //     if(videoInfo){
            //         const newEvent = { type: 'VideoData', videoData: videoInfo}
            //         _relayMessage(newEvent)
            //     }
            // }
            if (type === 'playVideo') {
                getPlayer().play();
            }
            if (type === 'pauseVideo') {
                getPlayer().pause();
            }
            if (type === 'seekTo') {
                getPlayer().currentTime = (evt.data.infoSending.eventData.time / 1000);
            }
            if (type === 'jumpToNext') {
                jumpToNext();
            }
            if (type === 'updateState') {
                const playerstate = {
                    //time: getMediaProp().contentTime * 1000,
                    time: document.querySelector('video').currentTime * 1000,
                    duration: document.querySelector('video').duration * 1000,
                    playbackState: _getPlaybackState(),
                };
                const newEvent = { type: 'updatedState', playerState: playerstate };
                _relayMessage(newEvent);
            }
            if (type === 'startListeningVideo') {
                console.log("Start listening received");
                let fullscreenDomTarget = '.btm-media-player';
                const video = getPlayer();
                if (video) {
                    video.addEventListener("loadstart", () => { _relayMessage({ type: 'videoLoadStart' }); });
                    video.addEventListener("loadeddata", () => { console.log("loadeddata works"); });
                    video.addEventListener("play", () => { _relayMessage({ type: 'onUserInteraction' }); });
                    video.addEventListener("pause", () => { _relayMessage({ type: 'onUserInteraction' }); });
                    video.addEventListener("seeking", () => { _relayMessage({ type: 'onUserInteraction' }); });
                }
                window.addEventListener("mouseup", (e) => { _onClick(e); });
                window.addEventListener("keyup", (e) => { _onPress(e); });
                let targetSettings = document.querySelector('.btm-media-overlays-container');
                //document.addEventListener('fullscreenchange', () => {_onFullScreen()})
                document.querySelector(fullscreenDomTarget).webkitRequestFullscreen = function () {
                    _relayMessage({ type: 'onFullscreen' });
                };
                document.querySelector(fullscreenDomTarget).msRequestFullscreen = function () {
                    _relayMessage({ type: 'onFullscreen' });
                };
                document.querySelector(fullscreenDomTarget).requestFullscreen = function () {
                    _relayMessage({ type: 'onFullscreen' });
                };
                settingsObserver.observe(targetSettings, { attributes: true, childList: true, subtree: true });
            }
            if (type === 'stopListeningVideo') {
                console.log("Stop listening received");
                const video = getPlayer();
                settingsObserver.disconnect();
                videoObserver.disconnect();
                if (video) {
                    video.removeEventListener("loadstart", () => { _relayMessage({ type: 'videoLoadStart' }); });
                    video.removeEventListener("play", () => { _relayMessage({ type: 'onUserInteraction' }); });
                    video.removeEventListener("pause", () => { _relayMessage({ type: 'onUserInteraction' }); });
                    video.removeEventListener("seeking", () => { _relayMessage({ type: 'onUserInteraction' }); });
                }
                window.removeEventListener("mouseup", (e) => { _onClick(e); });
                window.removeEventListener("keyup", (e) => { _onPress(e); });
                document.removeEventListener('fullscreenchange', () => { _onFullScreen(); });
                if (buttonViewTimeout) {
                    clearTimeout(buttonViewTimeout);
                }
            }
        }
    });
}

/******/ })()
;