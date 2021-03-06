import { TargetBrowser } from "Polyfill"

export const SWITCH_ON = 1;
export const SWITCH_LOCKED_ON = 2;
export const SWITCH_OFF = 0;
export const SWITCH_LOCKED_OFF = -1;

export const INITIAL_OPTIONS = {
    popup: {
        size: {
            width: 730,
            height: 450
        },
        scale: 0.8,
        showDetails: SWITCH_OFF,
        showPreview: SWITCH_ON,
        hideAfterTabSelection: SWITCH_ON,
        searchInURLs: SWITCH_OFF
    }
};
if (TargetBrowser === "chrome") {
    INITIAL_OPTIONS.popup.showPreview = SWITCH_LOCKED_OFF;
    INITIAL_OPTIONS.popup.hideAfterTabSelection = SWITCH_LOCKED_ON;
}
