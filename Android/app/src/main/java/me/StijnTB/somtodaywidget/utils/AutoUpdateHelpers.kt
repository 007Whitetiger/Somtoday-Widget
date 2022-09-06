package me.StijnTB.somtodaywidget.utils

import android.content.Context
import android.util.Log
import com.android.volley.Request
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import me.StijnTB.somtodaywidget.*
import net.fortuna.ical4j.data.CalendarBuilder
import net.fortuna.ical4j.model.Property
import net.fortuna.ical4j.model.component.VEvent
import net.fortuna.ical4j.model.property.DtEnd
import net.fortuna.ical4j.model.property.DtStart
import org.json.JSONArray
import org.json.JSONObject
import java.io.StringReader
import java.lang.Exception
import java.time.LocalDateTime


fun parseDateString(dateString: String): Array<Int> {
    val (date, time) = dateString.split("T")
    val year = date.substring(0, 4).toInt()
    val month = date.substring(4, 6).toInt()
    val day = date.substring(6, 8).toInt()
    val hour = time.substring(0, 2).toInt()
    val minute = time.substring(2, 4).toInt()

    val seconds = hour * 3600 + minute * 60

    val localDateTime = LocalDateTime.of(year, month, day, hour, minute)
    return arrayOf(localDateTime.dayOfWeek.value, seconds)
}


fun sendAutoUpdateRequest(context: MainActivity, url: String) {
    val volleyQueue = Volley.newRequestQueue(context)

    val stringRequest = StringRequest(Request.Method.GET, url,
        { response ->
            val stringReader = StringReader(response)

            val calendarBuilder = CalendarBuilder()
            val calendar = calendarBuilder.build(stringReader)

            val events = calendar.getComponents<VEvent>("VEVENT")

            val SchoolSchedule = JSONArray("[[], [], [], [], [], [], []]")

            var previousDate = 0;

            for (event in events) {

                var splitSummary = event.summary.value.split(" - ")
                if (splitSummary.size < 3) {
                    splitSummary = listOf(event.summary.value, "", "")
                }
                val (lokaal, vak, _leraar) = splitSummary

                val startDateString = event.getProperty<DtStart>(Property.DTSTART).date.toString()

                val (startDateDay, startDateSeconds) = parseDateString(startDateString)

                if (startDateDay < previousDate) {
                    break
                }
                previousDate = startDateDay

                val endDateString = event.getProperty<DtEnd>(Property.DTEND).date.toString()

                val endDateSeconds = parseDateString(endDateString)[1]

                Log.i(context.getString(R.string.widget_log_tag),"Day: ${startDateDay}, Start: $startDateSeconds, End: $endDateSeconds")
                val currentDayArray = SchoolSchedule.getJSONArray(startDateDay - 1)

                for ((i, classTime) in classTimes.withIndex()) {
                    Log.i(context.getString(R.string.widget_log_tag), "hour: ${i + 1}start: ${classTime[0]}, end: ${classTime[1]}")
                    // TODO I DO NOT UNDERSTAND
                    if (startDateSeconds <= classTime[0] && classTime[1] <= endDateSeconds) {
                        Log.i("TESTING", "FOUND")
                        currentDayArray.put(
                            JSONObject(
                                mapOf(
                                    Pair("vak", vak),
                                    Pair("lokaal", lokaal),
                                    Pair("hour", i + 1)
                                )
                            )
                        )
                    }
                }
                SchoolSchedule.put(startDateDay - 1, currentDayArray)
            }

            Log.i(context.getString(R.string.widget_log_tag), SchoolSchedule.toString())

            val nextHourWidgetData = JSONObject()
            nextHourWidgetData.put("classTimes", JSONArray(classTimes.map { JSONArray(it)}.toTypedArray()));
            nextHourWidgetData.put("breakTimes", JSONArray(breakTimes.map { JSONArray(it)}.toTypedArray()));
            nextHourWidgetData.put("breaksToNextHour", JSONArray(breaksToNextHour))
            val lastValueOfArray = SchoolSchedule.getJSONArray(SchoolSchedule.length() - 1)
            SchoolSchedule.remove(SchoolSchedule.length() - 1)
            val updatedSchoolSchedule = JSONArray()
            for (i in 1..SchoolSchedule.length()) {
                updatedSchoolSchedule.put(i, SchoolSchedule[i - 1])
            }
            updatedSchoolSchedule.put(0, lastValueOfArray)
            nextHourWidgetData.put("SchoolSchedule", updatedSchoolSchedule)
            val fileContent = nextHourWidgetData.toString()
            Log.i(context.getString(R.string.widget_log_tag), fileContent)

            nextHourWidgetData.put("SchoolSchedule", arrayOf(SchoolSchedule))
            try {
                updateSomtodayData(fileContent)
            } catch (e: Exception) {
                Log.e(context.getString(R.string.widget_log_tag), e.toString())
                context.setFailMessage(context.getString(R.string.main_activity_auto_update_malformed_data))
            }

            saveFile(context, fileContent)
            context.setSuccessMessage(context.getString(R.string.main_activity_auto_update_success))

            val sharedPref = context.getPreferences(Context.MODE_PRIVATE) ?: return@StringRequest
            with (sharedPref.edit()) {
                putString("calendarURL", url)
                apply()
            }

        },
        { Log.e(context.getString(R.string.widget_log_tag), it.toString()) })

    volleyQueue.add(stringRequest)
}