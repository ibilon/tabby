import "Polyfill"
import G from "./globals"
import { getTabId } from "./wtdom"
import { runAfterTabLoad } from "./wtutils";

export async function lastRecord() {
    return browser.storage.sync.get(["record"]).then(data => data.record);
}

export async function updateRecorderToolTip() {
    let r = await lastRecord();
    let restoreBtn = document.getElementById("restore-now");
    if (r) {
        restoreBtn.setAttribute("title", "Restore websites that have been saved on " + (new Date(r.timestamp)).toLocaleString());
        restoreBtn.removeAttribute("disabled");
    } else {
        restoreBtn.setAttribute("title", "Restore websites that have been saved");
        restoreBtn.setAttribute("disabled", "");
    }
}

function tabInfoToRecord(info) {
    return {
        url: info.url,
        pinned: info.pinned
    };
}
export async function record() {
    let recordArray = [];
    for (let windowEntry of G.tabsList.getElementsByClassName("window-entry")) {
        let windowRecord = [];
        for (let tabEntry of windowEntry.getElementsByClassName("tab-entry")) {
            await browser.tabs.sendMessage(getTabId(tabEntry), { target: "packd", data: { action: "pack" } }).then(async pack => {
                windowRecord.push(Object.assign({
                    pack: pack
                }, tabInfoToRecord(await browser.tabs.get(getTabId(tabEntry)))));
            }).catch(async reason => {
                windowRecord.push(Object.assign({
                    pack: undefined
                }, tabInfoToRecord(await browser.tabs.get(getTabId(tabEntry)))));
            });
        }
        recordArray.push(windowRecord);
    }
    let record = {
        timestamp: Date.now(),
        record: recordArray
    };
    return browser.storage.sync.set({ record: record }).then(() => updateRecorderToolTip());
}

export async function restore() {
    let { record: r } = await lastRecord();
    for (let windowRecord of r) {
        if (browser.runtime.getBrowserInfo) {
            windowRecord = windowRecord.filter(tabRecord => !tabRecord.url.startsWith("about:"))
        }
        browser.windows.create({
            url: windowRecord.map(tabRecord => tabRecord.url)
        }).then(async w => {
            for (let i = 0; i < windowRecord.length; i++) {
                let tabRecord = windowRecord[i];
                await browser.tabs.update(w.tabs[i].id, {
                    pinned: tabRecord.pinned
                }).then(t => {
                    if (tabRecord.pack) {
                        runAfterTabLoad(t.id, () => {
                            browser.tabs.sendMessage(t.id, {
                                target: "packd",
                                data: Object.assign({action: "unpack"}, tabRecord.pack)
                            });
                        });
                    }
                }).catch(e => {
                    console.log(e);
                });
            }
        });
    }
}
