/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

let resizeVisible;
function resizeYoutube(ytPlayer) {
    let video = document.querySelector('#movie_player');
    Object.getOwnPropertyNames(ytPlayer).forEach((prop) => {
        let obj = ytPlayer[prop];
        if (obj.toString() === 'function(a,b){this.width=a;this.height=b}') {
            const oldObj = obj;
            window._yt_player[prop] = function (a, b) {
                if (video.isFullscreen() && resizeVisible) {
                    //let adjustSize = window.outerWidth - window.innerWidth
                    let adjustSize = 14;
                    let aspectRatio = b / a;
                    a = a - (304 + adjustSize);
                    b = aspectRatio * a;
                }
                const x = new oldObj(a, b);
                return x;
            };
            window._yt_player[prop].prototype = oldObj.prototype;
            window.resizeScriptReady = true;
        }
    });
}
if (!window.videoIdScriptLoaded) {
    window.videoIdScriptLoaded = true;
    window.resizeScriptReady = false;
    window.addEventListener('YoutubeVideoMessage', function (event) {
        if (window.resizeScriptReady === false && window._yt_player) {
            resizeYoutube(window._yt_player);
        }
        if (event.detail) {
            var type = event.detail.type;
            if (type === 'pauseVideo') {
                getVideoElement().pauseVideo();
            }
            else if (type === 'playVideo') {
                getVideoElement().playVideo();
            }
            else if (type === 'getVideoTitle') {
                const video = getVideoElement();
                const data = video.getVideoData();
                const title = data.title;
                if (title) {
                    const titleEvent = new CustomEvent('FromNode', { detail: { type: 'VideoTitle', title: title } });
                    window.dispatchEvent(titleEvent);
                }
            }
            else if (type === 'setTheater') {
                setTheater();
            }
            else if (type === 'disableTheater') {
                disableTheater();
            }
            else if (type === 'getVideoId') {
                const videoId = getVideoElement().getVideoData().video_id;
                const isLive = getVideoElement().getVideoData().isLive;
                if (videoId) {
                    const videoIdEvent = new CustomEvent('FromNode', { detail: { type: 'VideoId', videoId: videoId, isLive: isLive } });
                    window.dispatchEvent(videoIdEvent);
                }
            }
            else if (type === 'seekTo') {
                const video = getVideoElement();
                if (video) {
                    video.seekTo(event.detail.seekTo);
                }
            }
            else if (type === 'getVideoTime') {
                const video = getVideoElement();
                if (video) {
                    const videoTime = video.getCurrentTime();
                    const videoTimeEvent = new CustomEvent('FromNode', { detail: { type: 'VideoTime', videoTime } });
                    window.dispatchEvent(videoTimeEvent);
                }
            }
            else if (type === 'jumpToNextEpisode') {
                const urlPath = `/watch?v=${event.detail.nextVideoId}`;
                const navigationData = {
                    "endpoint": {
                        "commandMetadata": {
                            "webCommandMetadata": {
                                "url": urlPath,
                                "rootVe": 3832,
                                "webPageType": "WEB_PAGE_TYPE_WATCH"
                            },
                            "watchEndpoint": {
                                "videoId": event.detail.nextVideoId,
                                "nofollow": true
                            }
                        }
                    }
                };
                const ytNavigator = document.querySelector('ytd-app');
                if (ytNavigator) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ytNavigator.fire("yt-navigate", navigationData);
                    const navigateEvent = new CustomEvent('FromNode', { detail: { type: 'Navigated' } });
                    window.dispatchEvent(navigateEvent);
                }
                else {
                    throw new Error("There is no navigation on this page");
                }
            }
            else if (type == 'SetChatVisible') {
                resizeVisible = event.detail.visible;
                const video = getVideoElement();
                if (video) {
                    video.setSize();
                    video.setInternalSize();
                }
            }
        }
    });
    const setTheater = () => {
        const inTheater = document.querySelector('ytd-watch-flexy');
        if (inTheater && inTheater.theater !== null) {
            const theaterButton = document.querySelector('.ytp-size-button');
            if (theaterButton && !inTheater.theater) {
                theaterButton.click();
                theaterButton.style.display = 'none';
            }
            if (theaterButton && inTheater.theater) {
                theaterButton.style.display = 'none';
            }
        }
    };
    const disableTheater = () => {
        const theaterButton = document.querySelector('.ytp-size-button');
        if (theaterButton) {
            theaterButton.style.display = '';
        }
    };
    const getVideoElement = () => {
        const url = window.location.href;
        let video;
        if (isPlayerPage()) {
            if (url.includes('/watch')) {
                video = document.querySelector('#movie_player');
            }
            else if (url.includes('/shorts/')) {
                video = document.querySelector('#shorts-player');
            }
            else {
                throw new Error("Unknown Video Type");
            }
        }
        return video;
    };
    const isPlayerPage = () => {
        //For shorts support
        if (window.location.href.includes('/watch') || window.location.href.includes('/shorts/')) {
            return true;
        }
        return false;
    };
}

/******/ })()
;