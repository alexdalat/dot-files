/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

(function () {
    const getReactInternals = (root) => {
        if (root == null) {
            return null;
        }
        var keys = Object.keys(root);
        var key = null;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].startsWith('__reactFiber$')) {
                key = keys[i];
                break;
            }
        }
        return key ? root[key] : null;
    };
    const getScrubberApi = () => {
        try {
            return getReactInternals(document.querySelector('.playback-scrubber-bar')).return.memoizedProps;
        }
        catch (e) {
            return undefined;
        }
    };
    const getPlayerApi = () => {
        try {
            return getReactInternals(document.querySelector('.playback-container')).return.memoizedProps;
        }
        catch (e) {
            return undefined;
        }
    };
    const getNextEpisodeApi = () => {
        try {
            return getReactInternals(document.querySelector('.playback-binge__container')).return.memoizedProps;
        }
        catch (e) {
            return undefined;
        }
    };
    let _checkForAds;
    let _isInAd = false;
    var seekInteraction = function (e) {
        try {
            if (e.source == window) {
                const playerState = getPlayerApi();
                const messageType = e.data.type;
                if (playerState && messageType) {
                    if (messageType === "GetState") {
                        const isPaused = playerState.sessionState === "PAUSED";
                        const time = playerState.elapsedTime;
                        const isLoading = playerState.isLoading;
                        const isSeeking = playerState.sessionState === "SEEKING";
                        const isAdPlaying = playerState.isAdPlaying;
                        const startOfCredits = playerState.startOfCredits;
                        const duration = playerState.duration;
                        if (isAdPlaying && !_isInAd) {
                            console.log("check for ads");
                            _checkForAds = setInterval(() => {
                                seekInteraction({ source: window, data: { type: "GetState" } });
                            }, 1000);
                            _isInAd = true;
                        }
                        else if (!isAdPlaying && _isInAd) {
                            console.log("clear interval");
                            clearInterval(_checkForAds);
                            _isInAd = false;
                        }
                        let evt = new CustomEvent('FromNode', {
                            detail: {
                                type: 'UpdateState', isPaused,
                                time, isLoading, isSeeking, isAdPlaying,
                                startOfCredits, duration, updatedAt: Date.now()
                            }
                        });
                        window.dispatchEvent(evt);
                    }
                    else if (messageType === "Seek") {
                        const scrubberApi = getScrubberApi();
                        const playerState = getPlayerApi();
                        const isPaused = playerState.sessionState === "PAUSED";
                        if (scrubberApi) {
                            console.log("Seek");
                            scrubberApi.seekAndUpdateElapsedTime(e.data.time);
                        }
                        const evt = new CustomEvent('FromNode', {
                            detail: {
                                type: 'Seek', isPaused, updatedAt: Date.now()
                            }
                        });
                        window.dispatchEvent(evt);
                    }
                    else if (messageType === "NextEpisode") {
                        const nextEpisodeApi = getNextEpisodeApi();
                        console.log(nextEpisodeApi);
                        const nextEpisodeId = `${nextEpisodeApi.bingePopUpAsset.contentId}/${nextEpisodeApi.bingePopUpAsset.providerVariantId}`;
                        const evt = new CustomEvent('FromNode', {
                            detail: {
                                type: 'NextEpisode', nextEpisodeId, updatedAt: Date.now()
                            }
                        });
                        window.dispatchEvent(evt);
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    if (!window.injectScriptLoaded) {
        window.injectScriptLoaded = true;
        console.log("Loaded TP Peacock Injected");
        window.addEventListener("message", seekInteraction, !1);
    }
})();

/******/ })()
;