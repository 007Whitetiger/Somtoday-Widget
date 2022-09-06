import fs from 'fs'

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

const file = JSON.parse(fs.readFileSync('./nextHourWidgetDataVersion2.json').toString());


const updatedClassTimes = file["classTimes"].map((value) => parseTwoTimeString(value))

const updatedBreakTimes = file["breakTimes"].map((value) => parseTwoTimeString(value))

const nextHourWidgetDataVersion3 = {
    classTimes: updatedClassTimes,
    breakTimes: updatedBreakTimes,
    breaksToNextHour: file["breaksToNextHour"],
    SchoolSchedule: file["SchoolSchedule"]
}
console.log(nextHourWidgetDataVersion3)

fs.writeFileSync("./nextHourWidgetDataVersion3.json", JSON.stringify(nextHourWidgetDataVersion3))
