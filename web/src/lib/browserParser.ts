import { session } from "$app/stores";
import { get } from "svelte/store";
import UAParser from "ua-parser-js";
import type {IBrowser} from 'ua-parser-js';
import { browser } from "$app/env";


let _userParser: UAParser;
const getUParser = () => {
    if (!browser) {
        // On server _userParser is never set
        // this because wrong values would be shown by SSR
        return new UAParser(get(session).userAgent);
    }
    if (!_userParser) {
        const userAgent = get(session).userAgent;
        console.log(userAgent)
        _userParser = new UAParser(userAgent);
    }
    return _userParser;
}

export const getBrowser = (): IBrowser => {
    const userParser = getUParser();
    const browser = userParser.getBrowser();
    if (browser.name == "Mobile Safari") {
        // Safari and Mobile Safari are 2 different browsers
        return {
            name: "Safari",
            version: browser.version,
            major: browser.major
        }
    } else {
        return browser;
    }
};
export const getDevice = () => getUParser().getDevice();
export const getBrowserAndDevice = () => {
    return {browser: getBrowser(), device: getDevice()}
}
