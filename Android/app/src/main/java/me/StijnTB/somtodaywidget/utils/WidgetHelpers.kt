package me.StijnTB.somtodaywidget.utils

import android.content.Context
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import me.StijnTB.somtodaywidget.R
import org.json.JSONArray

internal fun isBetween(numberBetween: Int, minMaxArray: Array<Int>): Boolean {
    return minMaxArray[0] <= numberBetween && numberBetween < minMaxArray[1];
}

internal inline fun <reified T> jsonArrayToArray(jsonArray: JSONArray): Array<T> {

    return Array(jsonArray.length()) {
        jsonArray[it] as T
    }
}

fun saveFile(context: Context, fileContent: String) {
    context.openFileOutput(context.getString(R.string.dataFile), AppCompatActivity.MODE_PRIVATE).use { fileOutput ->
        fileOutput.write(fileContent.toByteArray())
    }
}