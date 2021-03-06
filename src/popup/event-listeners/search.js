import "Polyfill"
import G from "../globals"
import { getTabId } from "../wtdom"
import { stopPropagation } from "../domutils";

// Init
export function initSearch() {
    document.getElementById("search").addEventListener("keypress", stopPropagation);
}

function keywordSearch(s, key) {
    let keywords = key.trim().split(" "), count = 0;
    for (let i = 0; i < keywords.length; i++) {
        let word = keywords[i];
        if (word.trim() !== "" && word.match(/^[a-zA-Z0-9]+$/)) {
            if (s.toUpperCase().includes(word.toUpperCase())) {
                count++;
            }
        }
    }
    return count >= 2;
}

function search(s, key) {
    return s.toUpperCase().includes(key.toUpperCase()) || keywordSearch(s, key);
}

// Search
export async function searchTextChanged(e) {
    let input, filter, tabEntries;
    input = document.getElementById("search");
    filter = input.value;
    tabEntries = document.getElementsByClassName("tab-entry");
    if (filter !== "") {
        for (let i = 0; i < tabEntries.length; i++) {
            let tabEntry = tabEntries[i];
            if (!search(tabEntry.getElementByClassName("tab-title").innerText, filter) &&
                !(G.searchInURLs && search((await browser.tabs.get(getTabId(tabEntry))).url, filter))) {
                tabEntry.style.display = "none";
            } else {
                tabEntry.style.display = "flex";
            }
        }
    } else {
        for (let i = 0; i < tabEntries.length; i++) {
            let tabEntry = tabEntries[i];
            tabEntry.style.display = "flex";
        }
    }
}
