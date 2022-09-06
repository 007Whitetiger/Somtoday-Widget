import ICAL from "ical.js";

const helpURL = "https://google.com/" // TODO add correct url (https:// requiered)

function parseICSData(icsData, nextHourWidgetData) {
  const { classTimes, breakTimes, breaksToNextHour } = nextHourWidgetData;

  const jCalData = ICAL.parse(icsData);
  const vCalendar = new ICAL.Component(jCalData);
  const subComponents = vCalendar.getAllSubcomponents("vevent");

  const SchoolSchedule = [[], [], [], [], [], [], []];

  let previousDay = 0;

  for (const subComponent of subComponents) {
    const vEvent = new ICAL.Event(subComponent);

    // console.log(vEvent.summary, vEvent.uid, vEvent.description);

    const [lokaal, vak, leraar] = vEvent.summary.split(" - ");
    const startDate = new Date();
    startDate.setTime(Date.parse(vEvent.startDate.toJSDate()));
    const startDateSeconds =
      startDate.getHours() * 3600 + startDate.getMinutes() * 60;

    const endDate = new Date();
    endDate.setTime(Date.parse(vEvent.endDate.toJSDate()));
    const endDateSeconds =
      endDate.getHours() * 3600 + endDate.getMinutes() * 60;

    console.log(
      `Day ${startDate.getDay()} at ${startDateSeconds}`
    );
    console.log(`Day ${endDate.getDay()} at ${endDateSeconds}`)

    if (startDate.getDay() < previousDay) break;

    previousDay = startDate.getDay();

    const dayList = SchoolSchedule[startDate.getDay()];

    for (let i = 0; i < classTimes.length; i++) {
      const classTime = classTimes[i];
      console.log(`hour: ${i + 1} start: ${classTime[0]}, end: ${classTime[1]}`)
      if (startDateSeconds <= classTime[0] && classTime[1] < endDateSeconds) {
        dayList.push({
          vak,
          lokaal,
          hour: i + 1,
        });
      }
    }
  }
  return { classTimes, breakTimes, breaksToNextHour, SchoolSchedule };
}

async function urlUpdateAction(nextHourWidgetData) {
  let url;
  if (Keychain.contains("nextHourWidgetSourceURL")) {
    const useSetUrlAlert = new Alert();
    useSetUrlAlert.message = "Wil je de reeds doorgegeven URL gebruiken?";
    useSetUrlAlert.addAction("ja");
    useSetUrlAlert.addAction("nee");
    useSetUrlAlert.addCancelAction("exit");
    const resultUseSetURLAlert = await useSetUrlAlert.present();
    switch (resultUseSetURLAlert) {
      case -1:
        return null;
      case 0: {
        url = Keychain.get("nextHourWidgetSourceURL");
      }
    }
  }
  if (!url) {
    const enterURLAlert = new Alert();
    enterURLAlert.message = "Kopieer de URL";
    enterURLAlert.addTextField("URL");
    enterURLAlert.addAction("submit");
    enterURLAlert.addCancelAction("exit");
    const resultEnterURLAlert = await enterURLAlert.present();
    if (resultEnterURLAlert == -1) {
      return null;
    } else {
      url = enterURLAlert.textFieldValue(0);
    }
  }
  console.log("sending request");
  try {
    const request = new Request(url);
    const resultOfRequest = await request.loadString();
    try {
      const parsedData = parseICSData(resultOfRequest, nextHourWidgetData);
      Keychain.set("nextHourWidgetData", JSON.stringify(parsedData));
      return false;
    } catch (e) {
      return `De data die opgehaald is voldoet niet. Probeer het opnieuw en check de URL of neem anders contact met ons op. (${helpURL})`;
    }
  } catch (e) {
    console.log(e);
    return "Er kan geen verbinding gemaakt worden met de server van Somtoday. Check je internet verbinding/Check of de URL goed gekopieerd is.";
  }
}

async function manualUpdateAction() {
  const onlineSetUpAlert = new Alert();
  onlineSetUpAlert.message = "Heb je de online handleiding al gevolgd?";
  onlineSetUpAlert.addAction("ja");
  onlineSetUpAlert.addAction("nee");
  const onlineSetUpAlertOutput = await onlineSetUpAlert.presentAlert();
  if (onlineSetUpAlertOutput == 0) {
    const fileMessageAlert = new Alert();
    fileMessageAlert.message = "Slecteer het bestand op de volgende pagina";
    fileMessageAlert.addAction("OK");
    await fileMessageAlert.presentAlert();
    const jsonConfigPath = (await DocumentPicker.open(["public.json"]))[0];
    const nextHourWidgetData = await getNextHourWidgetData(jsonConfigPath);
    Keychain.set("nextHourWidgetData", JSON.stringify(nextHourWidgetData));
    return false;
  } else {
    const redirectAlert = new Alert();
    redirectAlert.message =
      "klik op ok om door te gaan naar url.com en volg de instructies";
    redirectAlert.addAction("ok");
    redirectAlert.addCancelAction("exit");
    const resultRedirectAlert = await redirectAlert.present();

    if (resultRedirectAlert == -1) {
      return null;
    }
    try {
      Safari.open(helpURL);
    } catch (e) {
      console.log(e);
    }

    return null;
  }
}

async function getNextHourWidgetData(jsonConfigPath = "") {
  const iCloudFileManager = FileManager.iCloud();
  let path = "";
  if (jsonConfigPath) {
    path = jsonConfigPath;
  } else if (Keychain.contains("nextHourWidgetData")) {
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
    console.log(e);
    throw Error(e);
  }
}

(async () => {
  let nextHourWidgetData;

  try {
    nextHourWidgetData = await getNextHourWidgetData();
  } catch (_e) {
    /* ignore */
    console.log(_e);
  }
  const howToUpdateAlert = new Alert();

  howToUpdateAlert.message = "Hoe wil je bijwerken?";
  if (nextHourWidgetData) {
    howToUpdateAlert.addAction("auto update");
  }
  howToUpdateAlert.addAction("manual update");
  howToUpdateAlert.addCancelAction("exit");
  const actionChosen = await howToUpdateAlert.present();
  let error;
  if (actionChosen == -1) {
    return;
  } else if (actionChosen == 0 && nextHourWidgetData) {
    error = await urlUpdateAction(nextHourWidgetData);
  } else {
    try {
      error = await manualUpdateAction();
    } catch (e) {
      console.error(e);
      error = "Er is iets fout gegaan, probeer het op nieuw(" + e + ")";
    }
  }
  if (error) {
    //TODO add better error handling
    const errorAlert = new Alert();
    errorAlert.message = error;
    errorAlert.addCancelAction("exit");
    await errorAlert.present();
  } else if (error == null) {
    return;
  } else {
    const offSetAlert = new Alert();
    offSetAlert.message = "Enter offset time: ";
    const textField = offSetAlert.addTextField("in seconds");
    textField.setNumberPadKeyboard();
    offSetAlert.addAction("submit");
    await offSetAlert.present();
    const offsetValue = offSetAlert.textFieldValue(0);
    console.log(offsetValue);
    Keychain.set("nextHourWidgetOffset", offsetValue ? "0" : offsetValue);

    const finalAlert = new Alert();
    finalAlert.message = "You are done!";
    finalAlert.addCancelAction("ok");
    await finalAlert.presentAlert();
    
  }
})();
