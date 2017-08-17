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

var list_pages;

function remove_page(event)
{
    browser.storage.sync.get("initial_pages").then((data) => {
        var list = data["initial_pages"];
        list.splice(parseInt(event.target.dataset["index"]), 1);
        browser.storage.sync.set({"initial_pages": list}).then((data) => {list_pages(list)});
    });
}

list_pages = function(pages)
{
    
    if (pages)
    {
        var table = document.querySelector("#initial_pages");
        
        //remove old entries from options UI
        table.innerHTML = "";
        
        //add new entries
        for (var i=0; i<pages.length; i++)
        {
            var tr = document.createElement("tr");
            var page = document.createElement("td");
            var remove_button_cell = document.createElement("td");
            var remove_button = document.createElement("button");
            
            page.appendChild(document.createTextNode(pages[i]));
            page.style.paddingRight = "4rem";
            remove_button.appendChild(document.createTextNode(browser.i18n.getMessage("remove")));
            remove_button.dataset["index"] = i;
            remove_button.addEventListener("click", remove_page);
            
            remove_button_cell.appendChild(remove_button);
            tr.appendChild(page);
            tr.appendChild(remove_button_cell);
            table.appendChild(tr);
        }
    }
}

function add_page()
{
    var url_entry = document.querySelector("#url_entry");
    browser.storage.sync.get("initial_pages").then((data) => {
        var list = data["initial_pages"];
        if (list)
        {
            list.push(url_entry.value);
            browser.storage.sync.set({"initial_pages": list}).then((data) => {list_pages(list)});
        }
        else
            browser.storage.sync.set({"initial_pages": [url_entry.value]}).then((data) => {list_pages([url_entry.value])});
        url_entry.value = "";
    });
}

function clear_all_cookies()
{
    browser.storage.local.clear();
}

window.addEventListener("load", function() {
    browser.storage.sync.get("initial_pages").then((data) => {
        list_pages(data["initial_pages"]);
    });
    
    var add_page_button = document.querySelector("#add_page_button");
    add_page_button.appendChild(document.createTextNode(browser.i18n.getMessage("add_page")));
    add_page_button.addEventListener("click", add_page);
    
    var clear_all_cookies_button = document.querySelector("#clear_all");
    clear_all_cookies_button.appendChild(document.createTextNode(browser.i18n.getMessage("clear_all_cookies")));
    clear_all_cookies_button.addEventListener("click", clear_all_cookies);
    
    document.querySelector("#initial_pages_title").appendChild(document.createTextNode(browser.i18n.getMessage("initial_pages_title")));
    document.querySelector("#initial_pages_description").appendChild(document.createTextNode(browser.i18n.getMessage("initial_pages_description")));
    document.querySelector("#url_entry").placeholder = browser.i18n.getMessage("url_entry_placeholder");
});
