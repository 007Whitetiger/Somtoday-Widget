package me.StijnTB.somtodaywidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.util.TypedValue
import android.widget.RemoteViews
import me.StijnTB.somtodaywidget.utils.isBetween
import me.StijnTB.somtodaywidget.utils.jsonArrayToArray
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDateTime

/**
 * Implementation of App Widget functionality.
 */
class Somtoday : AppWidgetProvider() {
    private var fileUpdated = false
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // There may be multiple widgets active, so update all of them
        if (!fileUpdated) {
            context.openFileInput(context.getString(R.string.dataFile)).bufferedReader().useLines { lines ->
                val fileContents = lines.joinToString("")
                updateSomtodayData(fileContents)
            }
            fileUpdated = true
        }
        Log.i(context.getString(R.string.widget_log_tag), "Update!")
        for (appWidgetId in appWidgetIds) {
            try {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            } catch (e: Exception) {
                e.message?.let { Log.i(context.getString(R.string.widget_log_tag), it) }
            }
        }
    }

    override fun onEnabled(context: Context) {

    }

    override fun onDisabled(context: Context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        super.onReceive(context, intent)
        if (context == null) return

        if (intent?.action == REFRESH_ACTION) {
            val appWidgetManager = AppWidgetManager.getInstance(context);
            val widgetIds = appWidgetManager.getAppWidgetIds(ComponentName(context, Somtoday::class.java))

            widgetIds.forEach {
                updateAppWidget(context, appWidgetManager, it)
            }
        }
    }

}

const val REFRESH_ACTION = "android.appwidget.action.APPWIDGET_UPDATE"

const val offset = 5

var classTimes: Array<Array<Int>> = Array(0) { Array(0) { j -> j} };

var breakTimes: Array<Array<Int>> = Array(0) { Array(0) {j -> j} };
var breaksToNextHour = arrayOf(4,6,9)
// TODO android monday is 0 not sunday
var schoolSchedule = JSONArray("[[{\"vak\":\"Nederlandse taal en literatuur\",\"lokaal\":\"e20\",\"hour\":1},{\"vak\":\"economie\",\"lokaal\":\"e04\",\"hour\":2},{\"vak\":\"scheikunde\",\"lokaal\":\"t30\",\"hour\":3},{\"vak\":\"wiskunde B\",\"lokaal\":\"t41\",\"hour\":4},{\"vak\":\"lichamelijke opvoeding\",\"lokaal\":\"sp3\",\"hour\":5},{\"vak\":\"lichamelijke opvoeding\",\"lokaal\":\"sp3\",\"hour\":6},{\"vak\":\"wiskunde B\",\"lokaal\":\"t41\",\"hour\":7},{\"vak\":\"natuurkunde\",\"lokaal\":\"t34\",\"hour\":8}],[{\"vak\":\"economie\",\"lokaal\":\"e04\",\"hour\":1},{\"vak\":\"Latijnse taal en literatuur met kcv\",\"lokaal\":\"e38\",\"hour\":2},{\"vak\":\"Latijnse taal en literatuur met kcv\",\"lokaal\":\"e38\",\"hour\":3},{\"vak\":\"natuurkunde\",\"lokaal\":\"t34\",\"hour\":4},{\"vak\":\"wiskunde B\",\"lokaal\":\"t44\",\"hour\":5},{\"vak\":\"Nederlandse taal en literatuur\",\"lokaal\":\"e14\",\"hour\":6},{\"vak\":\"Engelse taal en literatuur\",\"lokaal\":\"e49\",\"hour\":7}],[{\"vak\":\"Latijnse taal en literatuur met kcv\",\"lokaal\":\"e49\",\"hour\":1},{\"vak\":\"scheikunde\",\"lokaal\":\"t22\",\"hour\":5},{\"vak\":\"e46 - vw5.kcv1 - VEM61\",\"lokaal\":\"e46\",\"hour\":6}],[{\"vak\":\"informatica\",\"lokaal\":\"e24i\",\"hour\":2},{\"vak\":\"mlx\",\"lokaal\":\"t27\",\"hour\":3},{\"vak\":\"wiskunde B\",\"lokaal\":\"t42\",\"hour\":4},{\"vak\":\"Engelse taal en literatuur\",\"lokaal\":\"e42\",\"hour\":5},{\"vak\":\"mlx\",\"lokaal\":\"t22\",\"hour\":6},{\"vak\":\"natuurkunde\",\"lokaal\":\"t29\",\"hour\":7},{\"vak\":\"scheikunde\",\"lokaal\":\"t22\",\"hour\":8}],[{\"vak\":\"Engelse taal en literatuur\",\"lokaal\":\"e42\",\"hour\":2},{\"vak\":\"Nederlandse taal en literatuur\",\"lokaal\":\"e17\",\"hour\":3},{\"vak\":\"Latijnse taal en literatuur met kcv\",\"lokaal\":\"e38\",\"hour\":4},{\"vak\":\"informatica\",\"lokaal\":\"e24i\",\"hour\":5},{\"vak\":\"economie\",\"lokaal\":\"e04\",\"hour\":6},{\"vak\":\"bedrijfseconomie\",\"lokaal\":\"e01\",\"hour\":7}],[], []]")


fun updateSomtodayData(fileContents: String) {
    val parsedFileContents = JSONObject(fileContents)
    Log.i("TESTING", parsedFileContents.getJSONArray("classTimes").toString())
    val jsonClassTimes = jsonArrayToArray<JSONArray>(parsedFileContents.getJSONArray("classTimes"))
    classTimes = jsonClassTimes.map { jsonArray -> jsonArrayToArray<Int>(jsonArray) }.toTypedArray()
    val jsonBreakTimes = jsonArrayToArray<JSONArray>(parsedFileContents.getJSONArray("breakTimes"))
    breakTimes = jsonBreakTimes.map { jsonArray -> jsonArrayToArray<Int>(jsonArray) }.toTypedArray()

    breaksToNextHour = jsonArrayToArray(parsedFileContents.getJSONArray("breaksToNextHour"))

    schoolSchedule = parsedFileContents.getJSONArray("SchoolSchedule")
    val firstValueOfSchoolSchedule = schoolSchedule.getJSONArray(0)
    schoolSchedule.remove(0)
    schoolSchedule.put(firstValueOfSchoolSchedule)
}


fun parseMinutesHoursString(stringToParse: String): Int {
    val splitTime = stringToParse.split(":")
    val parsedSplitTime = splitTime.map {
        it.toInt()
    }
    return parsedSplitTime[0] * 3600 + parsedSplitTime[1] * 60
}

fun parseTimeString(stringToParse: String): List<Int> {
    val timesToParse = stringToParse.split(" - ")
    val parsedTimes = timesToParse.map { parseMinutesHoursString(it) }
    return parsedTimes
}

fun getCurrentHour(currentHours: Int, currentMinutes: Int, offset: Int): Int {

    var minutes = currentMinutes - offset
    var hours = currentHours
    if (minutes < 0) {
        minutes += 60
        hours -= 1
    }

    val currentSeconds = hours * 3600 + minutes * 60
    Log.i("SomtodayWidget", "$hours:$minutes -> $currentSeconds")

    if (currentSeconds < classTimes[0][0]) return -1

    for (classTimeIndex in classTimes.indices) {
        val classTime = classTimes[classTimeIndex]
        if (isBetween(currentSeconds, classTime)) {
            return classTimeIndex + 1
        }
    }

    for (breakTimeIndex in breakTimes.indices) {
        val breakTime = breakTimes[breakTimeIndex]

        if (isBetween(currentSeconds, breakTime)) {
            return breaksToNextHour[breakTimeIndex] - 1
        }
    }

    return -2

}

internal fun getSubject(currentDay: Int, hour: Int): JSONObject? {
    val scheduleToDay = schoolSchedule.getJSONArray(currentDay)
    if (hour == -1 || scheduleToDay.length() == 0) {
        return null
    }

    for (subjectIndex in 0 until scheduleToDay.length()) {
        if (scheduleToDay.getJSONObject(subjectIndex).getInt("hour") >= hour) {
            return scheduleToDay.getJSONObject(subjectIndex);
        }
    }
    return null;
}

internal fun getRefreshPendingIntent(context: Context?, appWidgetId: Int): PendingIntent? {
    val intent = Intent(REFRESH_ACTION)
    intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
    return PendingIntent.getBroadcast(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
}


internal fun updateAppWidget(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int
) {
    Log.i(context.getString(R.string.widget_log_tag), schoolSchedule.toString())

    val currentDateTime = LocalDateTime.now()

    val currentHour = getCurrentHour(currentDateTime.hour, currentDateTime.minute, offset)
    val nextHour = currentHour + 1
    val currentDay = currentDateTime.dayOfWeek.value - 1


    Log.i(context.getString(R.string.widget_log_tag), "Day: $currentDay & next hour: $nextHour")
    val nextSubject = getSubject(currentDay, nextHour)

    val subjectName: String
    val subjectInfo: String

    if (nextSubject == null) {
        subjectName = "Niks"
        subjectInfo = "Geen school :)"
    } else {
        subjectName = nextSubject.getString("vak");
        subjectInfo = nextSubject.getString("lokaal") + " " + nextSubject.getString("hour");
    }


    // Construct the RemoteViews object
    val views = RemoteViews(context.packageName, R.layout.somtoday);
    views.setTextViewText(R.id.subjectName, subjectName)
    views.setOnClickPendingIntent(R.id.subjectName, getRefreshPendingIntent(context, appWidgetId))
    views.setOnClickPendingIntent(R.id.subjectInfo, getRefreshPendingIntent(context, appWidgetId))

    if (subjectName.length > 14) {
        views.setTextViewTextSize(R.id.subjectName, TypedValue.COMPLEX_UNIT_SP, 18F);
    } else {
        views.setTextViewTextSize(R.id.subjectName, TypedValue.COMPLEX_UNIT_SP, 22F);

    }

    views.setTextViewText(R.id.subjectInfo, subjectInfo)


    // Instruct the widget manager to update the widget
    appWidgetManager.updateAppWidget(appWidgetId, views)
}