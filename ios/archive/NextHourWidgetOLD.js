// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;


let SchoolSchedule = null;

const iCloudFileManager = FileManager.iCloud();
const dir = iCloudFileManager.documentsDirectory();
let path = '';


async function showConfigLoadAlert(error='') {
    const configLoadFailAlert = new Alert();
    configLoadFailAlert.message = `Something went wrong! Please do the setup again. ${error ? 'Error: ' + error : ''}`;
    await configLoadFailAlert.presentAlert();
    Script.complete();
    throw `Something went wrong! Please do the setup again. ${error ? 'Error: ' + error : ''}`
}

if (Keychain.contains('nextHourWidgetDataPath')) {
    path = Keychain.get('nextHourWidgetDataPath');
    if (!iCloudFileManager.fileExists(path)) {
        path = '';
    }
} else {
    showConfigLoadAlert("Setup not finished");
}
if (path == '') {
    showConfigLoadAlert("Config file does not exist")
}

try {
    await iCloudFileManager.downloadFileFromiCloud(path);
    const widgetData = Data.fromFile(path);
    var JSON_data = JSON.parse(widgetData.toRawString());
} catch (e) {
    showConfigLoadAlert();
}
// Add File Verification

const offset = 5;

SchoolSchedule = JSON_data['SchoolSchedule'];
const breaks = JSON_data['breakTimes'];
const breakToNextHour = JSON_data['breaksToNextHour'];
const timeToHour = JSON_data['classTimes'];
/**
 * 
 * @param {string} timeString 
 */
function parseTimeString(timeString) {
    const [hours, minutes] = timeString.split(':');
    return [parseInt(hours), parseInt(minutes)]
}

/**
 * @param {string} timeString 
 */
function parseTwoTimeString(timeString) {
    const [firstPart, secondPart] = timeString.split('-');
    const parsedFirstPart = parseTimeString(firstPart);
    const parsedSecondPart = parseTimeString(secondPart);
    return [parsedFirstPart[0] * 3600 + parsedFirstPart[1] *60, parsedSecondPart[0] * 3600 + parsedSecondPart[1] *60]
}

/**
 * @param {number} minutes
 * @param {number} hours
 * @param {number} offset
 * @returns {number} next hour
 */
function get_next_hour(minutes_to_do, hours_to_do, offset=0) {
    let minutes = minutes_to_do - offset;
    let hours = hours_to_do;
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    minutes *= 60
    hours *= 3600
    current_secconds = minutes + hours;
    if (current_secconds < parseTwoTimeString(timeToHour[0])[0]) {
        return -1
    }
    for (const time of timeToHour) {
        const parsedTime = parseTwoTimeString(time)
        if (parsedTime[0] <= current_secconds && current_secconds < parsedTime[1]) {
            return timeToHour.indexOf(time) + 1;
        }
    }
    for (const time of breaks) {
        const parsedTime = parseTwoTimeString(time);
        if (parsedTime[0] <= current_secconds && current_secconds < parsedTime[1]) {
            return breakToNextHour[breaks.indexOf(time)] - 1;
        }
    }
    return undefined;
    
}

const date = new Date();
const current_day = date.getDay()
const current_hour = 8//date.getHours();
const current_minute = 5//date.getMinutes();
const next_hour = get_next_hour(current_minute, current_hour, offset) + 1;

console.log(`Current day: ${current_day}`)
console.log(`Next hour: ${next_hour}`)

let widget = await createWidget();
Script.setWidget(widget);
Script.complete();


async function createWidget() {
    let widget = new ListWidget();
    widget.backgroundColor = new Color('004F9C');
    let current_subject;
    try {
        const day_data = SchoolSchedule[current_day];
        for (const course of day_data) {
            if (course.hour == next_hour) {
                current_subject = course
            }
        }
    } catch (e) {}
    if (!current_subject) {
        current_subject = {
            'vak': 'Niks',
            'lokaal': 'niet school',
            'hour': ':)'
        }
    }
    console.log(`Volgende vak: ${JSON.stringify(current_subject)}`)
    const subjectElement = widget.addText(current_subject.vak);
    subjectElement.font = new Font('San Francisco', 30);
    subjectElement.textColor = new Color('FFC600');
    widget.addSpacer(4)
    const roomElement = widget.addText(`${current_subject.lokaal} ${current_subject.hour}`);
    roomElement.textColor = new Color('FFFFFF');
    roomElement.font = new Font('San Francisco', 20);
    return widget
}
