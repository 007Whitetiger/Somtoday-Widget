(() => {

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
    

    const classTimeTable = document.querySelectorAll('.lesuur');
    let timeToHour = [];
    let parsedTimeToHour = [];
    for (const timeDuo of classTimeTable) {
        const time = timeDuo.querySelector('.uurTijd').innerHTML;
        timeToHour.push(time);
        parsedTimeToHour.push(parseTwoTimeString(time));
    }
    console.log(timeToHour);


    const breakTimeTable = document.querySelectorAll('.pauze');
    let breakToHour = [];
    let breakToNextHour = []
    for (const breakDuo of breakTimeTable) {
        const pauzetijden = breakDuo.querySelector('.pauzetijden').innerHTML;
        breakToHour.push(pauzetijden);
        const parsedTime = parseTwoTimeString(pauzetijden);
        for (let i = 0; i < parsedTimeToHour.length; i++) {
            if (parsedTimeToHour[i][1] <= parsedTime[0] && parsedTime[1] <= parsedTimeToHour[i + 1][0]) {
                breakToNextHour.push(i + 2);
                break;
            }
        }
    }
    console.log(breakToHour);
    console.log(breakToNextHour);


    const lessons = document.querySelectorAll('.truncate.afspraak:not(.nlg)');
    const parsedLessons = [[], [], [], [], [], [], []];
    console.log(lessons)

    const dayToIndex = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
    for (const lesson of lessons) {
        const subjectName = lesson.querySelector('.afspraakVakNaam').innerHTML;
        const subjectTime = lesson.querySelector('.afspraakTijden').innerHTML;
        const subjectRoom = lesson.querySelector('.afspraakLocatie').innerHTML;
        const subjectDay = lesson.querySelectorAll('.kwtinfo')[1].querySelector(':not(.bold)').innerHTML.substring(0, 2);
        const subjectDayNumber = dayToIndex.indexOf(subjectDay);
        const parsedTime = parseTwoTimeString(subjectTime);
        let subjectHour = -1;
        for (let i = 0; i < parsedTimeToHour.length; i++) {
            try {
                if (parsedTimeToHour[i][0] == parsedTime[0] && parsedTimeToHour[i][1] == parsedTime[1]) {
                    subjectHour = i + 1;
                    break;
                }
            } catch (e) {}
        }
        if (subjectHour == -1) {
            continue
        }
        parsedLessons[subjectDayNumber].push({
            "vak": subjectName,
            "lokaal": subjectRoom,
            "hour": subjectHour
        })
        
    }
    console.log(JSON.stringify(parsedLessons));
    const newWindow = window.open('about:blank');
    const newDocument = newWindow.document;
    // '+JSON.stringify(parsedLessons)+',schoolTimes='+JSON.stringify(timeToHour)+',breaksToNextHour='+JSON.stringify(breakToNextHour)+',schoolBreaks='+JSON.stringify(breakToHour)+'
    //newDocument.write('<!doctype html><title>SoLeEx</title><meta name=viewport content="width=device-width,initial-scale=1"><link rel=icon href=https://elo.somtoday.nl/favicon.ico><style>.timeTable{display:grid;grid-template-columns:1fr 1fr;justify-items:center;margin:2em 0}.class-time{display:grid;grid-template-columns:min-content 1fr;gap:1em;align-items:center}.remove-button{color:red;background-color:transparent;border:none;font-size:30px;font-weight:700;cursor:pointer}.timeTable h3,.timeTable p{margin:.2em 0}.days{display:flex;gap:1em;flex-direction:row;flex-wrap:wrap;justify-content:center}.day{border:solid 3px #004f9c;background-color:#004f9c;border-radius:1em;width:250px;display:grid;grid-template-rows:max-content 1fr;flex-direction:column;padding:.1em}.times{padding:1em;background-color:#fff;border-radius:0 0 1em 1em}.dayHeader{background-color:transparent}.dayHeader h2{color:#fff;margin-block:0;text-align:center}h1{text-align:center}.submitElement{display:flex;flex-direction:column;justify-items:center;align-items:center;margin:4em 0}.submitElement p{width:80%;text-align:center;max-width:600px}.submitElement button{width:40vw;height:4em;background-color:transparent;border:none;font-size:20px;font-weight:700;background-color:#004f9c;transition:background-color .4s;color:#000}.submitElement button:hover{background-color:#ffc600}.finishMessage{display:flex;flex-direction:column;justify-items:center;align-items:center}@media only screen and (max-width:550px){.day{width:90%;flex-direction:column}}</style><main><h1>Dit hebben we gevonden:</h1><div class=timeTable><div class=class-table></div><div class=break-table></div></div><div class=days></div></main><script>const schoolSchedule='+JSON.stringify(parsedLessons)+',schoolTimes='+JSON.stringify(timeToHour)+',breaksToNextHour='+JSON.stringify(breakToNextHour)+',schoolBreaks='+JSON.stringify(breakToHour)+',mainElement=document.querySelector("main"),daysElement=document.querySelector(".days");function parseTimeString(e){const[a,o]=e.split(":");return[parseInt(a),parseInt(o)]}const renderSchoolTimes=()=>{const e=document.querySelector(".class-table");e.innerHTML="<h2>Times</h2>";for(const a of schoolTimes){const o=document.createElement("div");o.className="class-time",o.innerHTML=`<h3>${schoolTimes.indexOf(a)+1}</h3><p>${a}</p>`,e.appendChild(o)}};renderSchoolTimes();const renderBreakTimes=()=>{const e=document.querySelector(".break-table");e.innerHTML="<h2>Breaks</h2>";for(let a=0;a<schoolBreaks.length;a++){const o=schoolBreaks[a],t=breaksToNextHour[a],n=document.createElement("p");n.innerHTML=`<button class="remove-button">-</button>${o} -> ${t}`,n.querySelector("button").addEventListener("click",()=>{n.remove(),schoolBreaks.splice(a,1);const e=breaksToNextHour[a];breaksToNextHour.splice(a,1);const t=o.split(" - "),r=parseTimeString(t[0]),l=parseTimeString(t[1]);let s;s=r[0]==l[0]?l[1]-r[1]:60-r[1]+60*(l[0]-r[0]-1)+l[1],console.log(s);for(let a=e-1;a<schoolTimes.length;a++){const e=schoolTimes[a].split(" - "),o=parseTimeString(e[0]),t=parseTimeString(e[1]);for(o[1]-=s;o[1]<0;)o[1]+=60,o[0]-=1;for(t[1]-=s;t[1]<0;)t[1]+=60,t[0]-=1;schoolTimes[a]=`${o[0]}:${o[1]} - ${t[0]}:${t[1]}`}for(let e=a;e<schoolBreaks.length;e++){const a=schoolBreaks[e].split(" - "),o=parseTimeString(a[0]),t=parseTimeString(a[1]);for(o[1]-=s;o[1]<0;)o[1]+=60,o[0]-=1;for(t[1]-=s;t[1]<0;)t[1]+=60,t[0]-=1;schoolBreaks[e]=`${o[0]}:${o[1]} - ${t[0]}:${t[1]}`}renderSchoolTimes(),renderBreakTimes()}),e.appendChild(n)}};renderBreakTimes();const dayList=[];for(const e of schoolSchedule){const a={};dayList.push(a);for(const o of e)Array.isArray(a[o.hour])?(console.log(`Already found more than twice: ${JSON.stringify(o)} - ${JSON.stringify(a[o.hour])}`),a[o.hour]=[...a[o.hour],o]):o.hour in a?(console.log(`Already found: ${JSON.stringify(o)} - ${JSON.stringify(a[o.hour])}`),a[o.hour]=[a[o.hour],o]):a[o.hour]=o}const dayIndexToName=["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"];for(const e of dayList){if(0==Object.keys(e).length)continue;const a=document.createElement("div");a.className="day",daysElement.appendChild(a);const o=document.createElement("div");o.className="dayHeader",o.innerHTML=`<h2>${dayIndexToName[dayList.indexOf(e)]}</h2>`,a.appendChild(o);const t=document.createElement("div");t.className="times",a.appendChild(t);for(const a of Object.entries(e))if(Array.isArray(a[1])){const o=document.createElement("div"),n=document.createElement("p");n.innerHTML=a[0]+":",o.appendChild(n);for(const t of a[1]){const n=document.createElement("button");n.innerHTML=t.vak,o.appendChild(n);const r=()=>{const n=document.createElement("p");n.innerHTML=`${a[0]} - ${t.vak}`,o.replaceWith(n),e[a[0]]=t,console.log(dayList)};n.addEventListener("click",r)}t.appendChild(o)}else{const e=document.createElement("p");e.innerHTML=`${a[0]} - ${a[1].vak}`,t.appendChild(e)}}const submitElement=document.createElement("div");submitElement.className="submitElement";const submitText=document.createElement("p");submitText.innerHTML="Wanneer je op de knop hier beneden drukt zal er een bestand gedownload worden. Selecteer dit bestand tijdens de setup in de Scriptable app!",submitElement.appendChild(submitText);const submitButton=document.createElement("button");submitButton.innerHTML="Submit",submitElement.appendChild(submitButton),submitButton.addEventListener("click",()=>{const e=[];dayList.forEach((a,o)=>{const t=[];e.push(t),Object.entries(a).forEach((e,o,n)=>{Array.isArray(e[1])&&(console.log(e),a[e[0]]=e[1][0]),t.push(a[e[0]])})});const a={classTimes:schoolTimes,breakTimes:schoolBreaks,breaksToNextHour:breaksToNextHour,SchoolSchedule:e},o="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(a)),t=document.createElement("a");t.hidden=!0,t.setAttribute("href",o),t.setAttribute("download","nextHourWidgetData.json"),document.body.appendChild(t),t.click(),t.remove(),mainElement.remove();const n=document.createElement("div");n.className="finishMessage",n.innerHTML="<h2>Downloading...</h2><p>Wacht tot het bestand gedownload is en ga dan verder in de Scriptable setup!</p>",document.body.appendChild(n)}),mainElement.appendChild(submitElement)</script><style>@import url(https://fonts.googleapis.com/css?family=Roboto);body{font-family:Roboto}</style>');
    newDocument.write('')
})()