/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

function doInject() {
    const CHAT_SIDEBAR_WIDTH = 304;
    function findVideoPlayerProps() {
        try {
            const propsParent = document.querySelector("#rn-video").parentElement;
            const key = Object.keys(propsParent).find(key => {
                return key.startsWith('__reactProps');
            });
            const propsRoot = propsParent[key];
            return propsRoot.children[1].props.videoPlayer;
        }
        catch (e) {
            return undefined;
        }
    }
    function findViewProps() {
        try {
            const propsParent = document.querySelector("#rn-video").parentElement;
            const key = Object.keys(propsParent).find(key => {
                return key.startsWith('__reactProps');
            });
            const propsRoot = propsParent[key];
            return propsRoot.children[2].props;
        }
        catch (e) {
            return undefined;
        }
    }
    function setChatVisible(visible) {
        const viewProps = findViewProps();
        viewProps.insets.right = visible ? CHAT_SIDEBAR_WIDTH : 0;
        const videoProps = findVideoPlayerProps();
        videoProps.seekTo(videoProps._videoEngine._videoPlayer._video._currentPosition - 0.0001);
    }
    function canFixChat() {
        const viewProps = findViewProps();
        const videoProps = findVideoPlayerProps();
        return videoProps && videoProps.seekTo && viewProps && viewProps.insets !== undefined && viewProps.insets.right !== undefined;
    }
    if (!window.nodeScriptLoaded) {
        console.log("VIDEO NODE SCRIPT");
        window.nodeScriptLoaded = true;
        window.addEventListener('tpVideoNode', function (evt) {
            var _a, _b, _c, _d;
            try {
                var type = evt.detail.type;
                if (type === 'seek') {
                    const props = findVideoPlayerProps();
                    if (props) {
                        props.seekTo(evt.detail.time);
                    }
                }
                else if (type === 'pause') {
                    const props = findVideoPlayerProps();
                    if (props) {
                        props.pause();
                    }
                }
                else if (type === 'play') {
                    const props = findVideoPlayerProps();
                    if (props) {
                        props.play();
                    }
                }
                else if (type === 'nextEpisode') {
                    const props = findVideoPlayerProps();
                    if (props) {
                        const videoType = (_a = evt.detail.videoType) !== null && _a !== void 0 ? _a : "episode";
                        const videoId = evt.detail.videoId;
                        const urn = `urn:hbo:${videoType}:${videoId}`;
                        props.loadByUrn(urn);
                    }
                }
                else if (type === 'UpdateState') {
                    const props = findVideoPlayerProps();
                    if (props) {
                        const playerState = {
                            playbackState: props._videoEngine._videoPlayer._video.playbackState,
                            time: props._uiManager._uiState.timelinePosition * 1000,
                            currentAd: props._store.getState().AdsManager.activeAdBreak,
                            videoId: props._store.getState().VideoPlayer.cutId,
                            duration: props._uiManager._uiState.timelineDuration * 1000,
                            canFixChat: canFixChat(),
                            seriesName: (_b = props._store.getState().ContentManager.fullSeriesTitle) !== null && _b !== void 0 ? _b : props._store.getState().ContentManager.shortSeriesTitle,
                            episodeName: (_c = props._store.getState().ContentManager.fullTitle) !== null && _c !== void 0 ? _c : props._store.getState().ContentManager.shortTitle,
                            episodeNum: (_d = props._store.getState().ContentManager.numberInSeason) !== null && _d !== void 0 ? _d : props._store.getState().ContentManager.numberInSeries,
                            seasonNum: props._store.getState().ContentManager.seasonNumber
                        };
                        let evt = new CustomEvent('FromNode', { detail: { type: 'StateUpdate', playerState: playerState, updatedAt: new Date().getTime() } });
                        window.dispatchEvent(evt);
                    }
                }
                else if (type == 'SetChatVisible') {
                    const visible = evt.detail.visible;
                    setChatVisible(visible);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
doInject();

/******/ })()
;