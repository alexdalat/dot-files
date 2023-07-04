/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

if (!window.videoIdScriptLoaded) {
    console.log("Browse script loaded");
    window.videoIdScriptLoaded = true;
    window.addEventListener('AmazonVideoMessage', function (evt) {
        var type = evt.detail.type;
        if (type === 'getVideoId') {
            const videoId = findTitle();
            if (videoId) {
                const newEvent = new CustomEvent('FromNode', { detail: { type: 'VideoId', videoId: videoId, updatedAt: new Date().getTime() } });
                window.dispatchEvent(newEvent);
            }
        }
    });
    var findTitle = function () {
        var _a;
        try {
            const elementRoot = document.querySelector('.atvwebplayersdk-title-text');
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
            // const sectionPath = elementRoot[key].stateNode.current.memoizedState.element.props.state.action.atf
            // const titlePath = Object.values(sectionPath)[0].watchPartyAction.endpoint.query.titleId
            const section_path = elementRoot[key].return.return.stateNode.context.stores.adPlayback.player.ui.xrayController.controller.metricsFeature.mediaEventController.acquisitionMediaEventController.mpPlayer.primaryContentMpPlayer.contentSource.mediaRepresentation.dashMediaRepresentationContext.sourceUrlStore.mediaEventReportingPlaylistListener.titleView.currentItem;
            //All videos contain the returnedTitleRendition.asin; This leads to an ID that gets the correct season and episode number (not the same as the one in the URL)
            //I believe that the returnedTitleRendition ID is good enough, however, because we want amzn1. ID we can use a path that is found in majority of the videos
            //I've looked through about 20+ videos and I've only found 1 that didn't have a catalog.id (it had the returnedTitleRendition.asin)
            //So I've decided to use the returnedTitleRendition.asin as a fallback since it works perfectly for the purposes of a videoID. 
            //My recommendation is that we use the returnedTitleRendition.asin as it is unique to each episoe and will take us to the right destination 10/10 times
            const titlePath = (_a = section_path.catalogMetadata.catalog.id) !== null && _a !== void 0 ? _a : section_path.returnedTitleRendition.asin;
            if (key == null || typeof elementRoot[key] === 'undefined' || typeof titlePath === 'undefined') {
                return null;
            }
            return titlePath;
        }
        catch (err) {
            return undefined;
        }
    };
}

/******/ })()
;