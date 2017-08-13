/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2017  Marco Scarpetta
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

var window_id = null;
var cookie_store_id = null;

function on_cookie_changed(info)
{
    if (info.cookie.storeId == cookie_store_id)
    {
        //remove cookie from saved ones
        if (info.removed)
        {
            browser.storage.local.remove(info.cookie.domain + info.cookie.path + info.cookie.name);
        }
        //save the cookie
        else
        {
            var obj = {};
            obj[info.cookie.domain + info.cookie.path + info.cookie.name] = info.cookie;
            browser.storage.local.set(obj);
        }
    }
}

function on_cookies_set(data) {
    
}

function on_private_window_created(window) {
    window_id = window.id;
    
    //get all cookies saved during the previous session
    var gettingItem = browser.storage.local.get();
    gettingItem.then(function(data) {
        //set saved cookies for this session
        var promises = []
        for (var key in data)
        {
            //generate 'url' property from 'domain' and 'path' properties
            data[key]["url"] = (data[key]["secure"] ? "https://" : "http://") + 
                (data[key]["domain"].charAt(0) == '.' ? data[key]["domain"].substr(1) : data[key]["domain"]) +
                data[key]["path"];
            //delete unwanted properties
            delete data[key]["session"];
            delete data[key]["hostOnly"];
            //set cookie
            promises.push(browser.cookies.set(data[key]));
        }
        
        Promise.all(promises).then((data) => {
            //add event listener for cookie changed
            var promise = browser.cookies.getAllCookieStores();
            promise.then(function(cookies) {
                cookie_store_id = cookies[1].id;
                browser.cookies.onChanged.addListener(on_cookie_changed);
                
                //open tabs
                browser.storage.sync.get("initial_pages").then((data) => {
                    var list = data["initial_pages"];
                    
                    if (list && list.length > 0)
                    {
                        browser.tabs.update(window.tabs[0].id, {"url": list[0]});
                        
                        for (var i=1; i<list.length; i++)
                            browser.tabs.create({"url": list[i], "windowId": window_id, "active": false});
                    }
                });
            });
        });
    });
}

function handleBrowserActionClicked()
{
    var promise = browser.windows.create({"incognito": true});
    promise.then(on_private_window_created);
}

function onWindowClose(id)
{
    if (id == window_id)
        browser.cookies.onChanged.removeListener(on_cookie_changed);
}

browser.browserAction.onClicked.addListener(handleBrowserActionClicked);

browser.windows.onRemoved.addListener(onWindowClose);
