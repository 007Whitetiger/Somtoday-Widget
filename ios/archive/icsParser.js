import ICAL from 'ical.js';
import fs from 'fs';

const nextHourWidgetData = JSON.parse(fs.readFileSync('./nextHourWidgetDataVersion3.json').toString());
const classTimes = nextHourWidgetData["classTimes"];
console.log(nextHourWidgetData)

const icsData = fs.readFileSync("./nextHourWidget.ics").toString();
const jCalData = ICAL.parse(icsData);
const vCalendar = new ICAL.Component(jCalData);
const subComponents = vCalendar.getAllSubcomponents("vevent")

const SchoolSchedule = [[], [], [], [], [], [], []] 

let previousDay = 0;

for (const subComponent of subComponents) {
    const vEvent = new ICAL.Event(subComponent);

    console.log(vEvent.summary, vEvent.uid, vEvent.description);

    const [lokaal, vak, leraar] = vEvent.summary.split(" - ")
    const startDate = new Date();
    startDate.setTime(Date.parse(vEvent.startDate.toJSDate()));
    const startDateSeconds = startDate.getHours() * 3600 + startDate.getMinutes() * 60;

    const endDate = new Date();
    endDate.setTime(Date.parse(vEvent.endDate.toJSDate()));
    const endDateSeconds = endDate.getHours() * 3600 + endDate.getMinutes() * 60;


    console.log(`Day ${startDate.getDay()} at ${startDateSeconds}`, `Day ${endDate.getDay()} at ${endDateSeconds}`);

    if (startDate.getDay() < previousDay) break;

    previousDay = startDate.getDay();

    const dayList = SchoolSchedule[startDate.getDay()];

    for (let i = 0; i < classTimes.length; i++) {
        const classTime = classTimes[i];
        if (startDateSeconds <= classTime[0] && classTime[0] < endDateSeconds) {
            dayList.push({
                vak, lokaal, hour: i + 1
            })
        }
    }
    
}

fs.writeFileSync("./icsParsed.json", JSON.stringify(SchoolSchedule, null, 4))
