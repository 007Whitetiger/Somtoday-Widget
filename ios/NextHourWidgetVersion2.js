// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: calendar-alt;

async function getNextHourWidgetData(jsonConfigPath="") {
  const iCloudFileManager = FileManager.iCloud();
  let path = "";
  if(jsonConfigPath) {
    path = jsonConfigPath
  }else if (Keychain.contains("nextHourWidgetData")) {
    return JSON.parse(Keychain.get("nextHourWidgetData"));
  } else {
    throw Error("Setup not finished");
  }

  try {
    await iCloudFileManager.downloadFileFromiCloud(path);
    const widgetData = Data.fromFile(path);
    // Add File Verification
    return JSON.parse(widgetData.toRawString());
  } catch (e) {
    console.log(e)
    throw Error(e);
  }
}



/**
 *
 * @param {string} timeString
 */
function parseTimeString(timeString) {
  const [hours, minutes] = timeString.split(":");
  return [parseInt(hours), parseInt(minutes)];
}

/**
 * @param {string} timeString
 */
function parseTwoTimeString(timeString) {
  const [firstPart, secondPart] = timeString.split("-");
  const parsedFirstPart = parseTimeString(firstPart);
  const parsedSecondPart = parseTimeString(secondPart);
  return [
    parsedFirstPart[0] * 3600 + parsedFirstPart[1] * 60,
    parsedSecondPart[0] * 3600 + parsedSecondPart[1] * 60,
  ];
}

/**
 * @param {number} minutes
 * @param {number} hours
 * @param {number} offset
 * @returns {number} next hour
 */
function get_next_hour(
  minutes_to_do,
  hours_to_do,
  breakTimes,
  breaksToNextHour,
  classTimes,
  offset
) {
  let minutes = minutes_to_do - offset;
  let hours = hours_to_do;
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  minutes *= 60;
  hours *= 3600;
  current_secconds = minutes + hours;
  if (current_secconds < classTimes[0][0]) {
    return 0;
  }
  for (const time of classTimes) {
    if (time[0] <= current_secconds && current_secconds < time[1]) {
      return classTimes.indexOf(time) + 1;
    }
  }
  for (const time of breakTimes) {
    if (time[0] <= current_secconds && current_secconds < time[1]) {
      return breaksToNextHour[breakTimes.indexOf(time)] - 1;
    }
  }
  return undefined;
}

function getNextSubject(SchoolSchedule, current_day, next_hour) {
  let current_subject;
  try {
    const day_data = SchoolSchedule[current_day];
    for (const course of day_data) {
      console.log(course);
      if (course.hour >= next_hour) {
        current_subject = course;
        break;
      }
    }
  } catch (e) {}
  if (!current_subject) {
    current_subject = {
      vak: "Niks",
      lokaal: "niet school",
      hour: ":)",
    };
  }
  return current_subject;
}


let widget = await createWidget();
Script.setWidget(widget);
Script.complete();

async function createWidget() {
  let widget = new ListWidget();
  widget.backgroundColor = new Color("004F9C");

  try {
    var { SchoolSchedule, breakTimes, breaksToNextHour, classTimes } =
      await getNextHourWidgetData();
    console.log(breaksToNextHour);
    var offset = parseInt(Keychain.get("nextHourWidgetOffset"));
    console.log(offset);
  } catch (e) {
    widget.addText("Please do setup!");
    return widget;
  }

  const date = new Date();
  const current_day = date.getDay()
  const current_hour = date.getHours();
  const current_minute = date.getMinutes();
  const next_hour =
    get_next_hour(
      current_minute,
      current_hour,
      breakTimes,
      breaksToNextHour,
      classTimes,
      offset
    ) + 1;

  console.log(`Current day: ${current_day}`);
  console.log(`Next hour: ${next_hour}`);

  const nextSubject = getNextSubject(SchoolSchedule, current_day, next_hour);

  console.log(`Volgende vak: ${JSON.stringify(nextSubject)}`);
  const subjectElement = widget.addText(nextSubject.vak);
  subjectElement.font = new Font("San Francisco", 20);
  subjectElement.textColor = new Color("FFC600");
  widget.addSpacer(4);
  const roomElement = widget.addText(
    `${nextSubject.lokaal} ${nextSubject.hour}`
  );
  roomElement.textColor = new Color("000000");
  roomElement.font = new Font("San Francisco", 20);
  return widget;
}
