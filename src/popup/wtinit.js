import "Polyfill"
import G from "./globals"
import { getImage } from "./net"
import { getCorrectTabId } from "./wrong-to-right"
import { getWindows, correctFocused } from "./wtutils"
import { getActualHeight, stopPropagation } from "./domutils"
import { windowEntryDragStarted, windowEntryDraggingOver, windowEntryDropped, windowEntryTitleClicked, windowCloseClick } from "./event-listeners/windowEntry"
import { tabEntryMouseOver, tabEntryMouseLeave, tabEntryClicked, tabCloseClick, tabPinClick } from "./event-listeners/tabEntry"

// Update tabs
export function updateTabs(windows) {
    G.tabsList.innerHTML = "";
    let tabsListFragment = document.createDocumentFragment();
    let currentWindowEntry;
    /* Predefined elements for faster performance */
    // Window close button
    let WINDOW_CLOSE_BTN = document.createElement("span");
    WINDOW_CLOSE_BTN.classList.add("inline-button");
    WINDOW_CLOSE_BTN.classList.add("img-button");
    WINDOW_CLOSE_BTN.classList.add("opacity-changing-button");
    WINDOW_CLOSE_BTN.classList.add("window-entry-remove-btn");
    WINDOW_CLOSE_BTN.style.backgroundImage = "url(../icons/close.svg)";
    let DIV = document.createElement("div");
    DIV.style.display = "inline-block";
    WINDOW_CLOSE_BTN.appendChild(DIV);
    // Tab close button
    let TAB_CLOSE_BTN = document.createElement("span");
    TAB_CLOSE_BTN.classList.add("inline-button");
    TAB_CLOSE_BTN.classList.add("red-button");
    TAB_CLOSE_BTN.classList.add("img-button");
    TAB_CLOSE_BTN.classList.add("tab-entry-remove-btn");
    TAB_CLOSE_BTN.style.backgroundImage = "url(../icons/close.svg)";
    // Tab pin button
    let TAB_PIN_BTN = document.createElement("span");
    TAB_PIN_BTN.classList.add("inline-button");
    TAB_PIN_BTN.classList.add("img-button");
    TAB_PIN_BTN.classList.add("opacity-changing-button");
    TAB_PIN_BTN.classList.add("tab-entry-pin-btn");
    TAB_PIN_BTN.style.backgroundImage = "url(../icons/pin.svg)";
    // Loop through windows
    for (let i = 0; i < windows.length; i++) {
        // Set w to window
        let w = windows[i];

        // Create window entry
        let windowEntry = document.createElement("li");
        windowEntry.classList.add("window-entry");
        windowEntry.classList.add("category");

        // Create window entry fragment
        let windowEntryFragment = document.createDocumentFragment();

        // Set window id to window entry
        windowEntry.setAttribute("data-window_id", w.id);
        let span = document.createElement("span");
        span.addEventListener("click", windowEntryTitleClicked);

        // Create close button
        let closeBtn = WINDOW_CLOSE_BTN.cloneNode(true);
        closeBtn.addEventListener("click", windowCloseClick);

        // Buttons wrapper
        let buttons = document.createElement("span");
        buttons.classList.add("window-entry-buttons");
        buttons.appendChild(closeBtn);
        
        // Create window name span
        let windowName = document.createElement("span");
        windowName.classList.add("window-title");
        windowName.textContent += "Window " + (i+1);

        // Check if window is focused
        if (w.focused) {
            currentWindowEntry = windowEntry;
            windowEntry.classList.add("current-window");
            windowName.textContent += " - Current";
        }
        // Check if window is incognito
        if (w.incognito) {
            windowEntry.classList.add("incognito-window");
            windowName.textContent += " (Incognito)";
        }

        span.appendChild(windowName);
        span.appendChild(buttons);

        span.classList.add("darker-button");

        windowEntryFragment.appendChild(span);

        // Add window entry dragstart, dragover, and drop event listeners
        windowEntry.addEventListener("dragstart", windowEntryDragStarted);
        windowEntry.addEventListener("dragover", windowEntryDraggingOver);
        windowEntry.addEventListener("drop", windowEntryDropped);
        windowEntry.setAttribute("draggable", "true");

        let windowTabsList = document.createElement("ul");
        windowTabsList.classList.add("category-list");
        windowTabsList.classList.add("window-entry-tabs");

        let windowTabsListFragment = document.createDocumentFragment();
        // Loop through tabs
        for (let i = 0; i < w.tabs.length; i++) {
            let tab = w.tabs[i];
            // Check tab id
            if (tab.id !== browser.tabs.TAB_ID_NONE) {
                // Create tab entry
                let tabEntry = document.createElement("li");
                tabEntry.classList.add("tab-entry");
                tabEntry.classList.add("button");
                // Set tab entry as draggable. Required to enable move tab feature
                tabEntry.setAttribute("draggable", "true");

                // Create tab entry fragment
                let tabEntryFragment = document.createDocumentFragment();

                let favicon;
                let title = document.createElement("span");
                title.classList.add("tab-title");
                title.textContent += tab.title;
                let titleWrapper = document.createElement("div");
                titleWrapper.classList.add("tab-title-wrapper");
                titleWrapper.appendChild(title);

                if (tab.active) {
                    tabEntry.classList.add("current-tab");
                }

                favicon = document.createElement("img");
                favicon.classList.add("tab-entry-favicon");

                if (tab.favIconUrl) {
                    let favIconPromise;
                    if (w.incognito) {
                        favIconPromise = getImage(tab.favIconUrl, true);
                    } else {
                        favIconPromise = getImage(tab.favIconUrl);
                    }
                    favIconPromise.then(base64Image => {
                        favicon.src = base64Image;
                    });
                } else {
                    favicon.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                }

                // Create close button
                closeBtn = TAB_CLOSE_BTN.cloneNode(false);
                closeBtn.addEventListener("click", tabCloseClick);
                closeBtn.addEventListener("mouseover", stopPropagation);

                // Create pin button
                let pinBtn = TAB_PIN_BTN.cloneNode(false);
                pinBtn.addEventListener("click", tabPinClick);
                pinBtn.addEventListener("mouseover", stopPropagation);

                // Buttons wrapper
                buttons = document.createElement("span");
                buttons.classList.add("tab-entry-buttons");

                // Set tab entry tab id
                tabEntry.setAttribute("data-tab_id", getCorrectTabId(tab.id));
                if (favicon !== undefined) {
                    tabEntryFragment.appendChild(favicon);
                } else {
                    tabEntry.classList.add("noicon");
                }
                tabEntryFragment.appendChild(titleWrapper);
                tabEntryFragment.appendChild(buttons);
                
                tabEntry.appendChild(tabEntryFragment);

                tabEntry.addEventListener("mouseover", tabEntryMouseOver);
                tabEntry.addEventListener("mouseleave", tabEntryMouseLeave);
                tabEntry.addEventListener("click", tabEntryClicked);

                if (tab.pinned) {
                    pinBtn.style.backgroundImage = "url(../icons/pinremove.svg)";
                    tabEntry.classList.add("pinned-tab");
                    let pinnedTabs = Array.from(windowTabsList.getElementsByClassName("pinned-tab"));
                    let lastPinnedTab = pinnedTabs[pinnedTabs.length-1];
                    if (lastPinnedTab !== undefined) {
                        windowTabsListFragment.insertBefore(tabEntry, lastPinnedTab.nextSibling);
                    } else {
                        windowTabsListFragment.insertBefore(tabEntry, windowTabsList.childNodes[0]);
                    }
                } else {
                    windowTabsListFragment.appendChild(tabEntry);
                }
            }
        }

        // Append fragment to actual windowTabsList
        windowTabsList.appendChild(windowTabsListFragment);

        windowEntryFragment.appendChild(windowTabsList);
        windowEntry.appendChild(windowEntryFragment);
        tabsListFragment.appendChild(windowEntry);
    }
    G.tabsList.appendChild(tabsListFragment);
    G.tabsList.addEventListener("click", stopPropagation);
    document.getElementById("tabs").style.display = "block";
    currentWindowEntry.scrollIntoView({ behavior: 'smooth' });
}

// Add tabs to list
export async function populateTabsList() {
    let windows = await getWindows();
    await correctFocused(windows);
    updateTabs(windows);
}

// Set tabs list height to any available height
export function extendTabsList() {
    let searchArea = document.getElementById("search-area");
    let searchAreaHeight = getActualHeight(searchArea);
    let tabs = document.getElementById("tabs");
    tabs.style.height = "calc(100% - " + searchAreaHeight + "px)";
}
