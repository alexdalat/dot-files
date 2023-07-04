/**
 * (c) 2013 Rob Wu <rob@robwu.nl>
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* jshint browser:true, devel:true */
/* globals chrome, get_crx_url, get_zip_name, can_viewsource_crx_url, openCRXasZip */
/* globals encodeQueryString */
'use strict';
var cws_url;
var crx_url;
var filename;

// See bg-contextmenu for potential values, at MENU_ID_ACTION_MENU.
var gActionClickAction = 'popup';

initialize();

function initialize() {
    var storageIsReady = false;

    // Get CWS URL. On failure, close the popup
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        cws_url = tabs[0].url;
        crx_url = get_crx_url(cws_url);
        filename = get_zip_name(crx_url);
        if (!can_viewsource_crx_url(crx_url)) {
            chrome.pageAction.hide(tabs[0].id);
            window.close();
            return;
        }
        ready();
        if (storageIsReady) {
            ready2();
        }
    });
    chrome.storage.sync.get({
        actionClickAction: gActionClickAction,
    }, function(items) {
        gActionClickAction = items && items.actionClickAction || gActionClickAction;
        storageIsReady = true;
        if (crx_url) {
            ready2();
        }
    });
}

function ready() {
    document.getElementById('download').onclick = doDownload;
    document.getElementById('view-source').onclick = doViewSource;
    // When the settings have been read, ready2 will run to finish.
}
function ready2() {
    if (gActionClickAction == 'popup') {
        // Default action is keeping this popup open.
        // Nothing else left to do.
    } else if (gActionClickAction == 'download') {
        doDownload();
    } else if (gActionClickAction == 'view-source') {
        doViewSource();
    }
}
var hasDownloadedOnce = false;
function doDownload() {
    if (hasDownloadedOnce) {
        console.log('Download is pending.');
        return;
    }
    openCRXasZip(crx_url, function(blob, publicKey) {
        tryTriggerDownload(blob, filename);
    }, function(errorMessage) {
        hasDownloadedOnce = false;
        document.getElementById('download').classList.toggle('downloading', hasDownloadedOnce);
        console.error(errorMessage);
        alert('Error in CRX Viewer:\n\n' + errorMessage);
    }, onXHRprogress.bind(null, document.getElementById('download')));
    hasDownloadedOnce = true;
    document.getElementById('download').classList.toggle('downloading', hasDownloadedOnce);
}
function doViewSource() {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
    }, function(tabs) {
        chrome.tabs.create({
            url: chrome.extension.getURL('crxviewer.html') +
                '?' + encodeQueryString({crx: crx_url, zipname: filename}),
            active: true,
            index: tabs && tabs.length ? tabs[0].index + 1 : undefined,
        }, function() {
            window.close();
        });
    });
}
function onXHRprogress(progressContainer, xhrProgressEvent) {
    var progressBar = progressContainer.querySelector('progress');
    if (!progressBar) {
        progressBar = document.createElement('progress');
        progressContainer.appendChild(progressBar);
    }
    if (xhrProgressEvent.lengthComputable) {
        progressBar.max = xhrProgressEvent.total;
        progressBar.value = xhrProgressEvent.loaded;
    } else {
        progressBar.removeAttribute('value');
    }
}

function tryTriggerDownload(blob, filename) {
    chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: filename
    }, function() {
        // The popup should have closed already, but if not, do it now.
        window.close();
    });
}

