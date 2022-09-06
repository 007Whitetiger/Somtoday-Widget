package me.StijnTB.somtodaywidget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import me.StijnTB.somtodaywidget.utils.saveFile
import me.StijnTB.somtodaywidget.utils.sendAutoUpdateRequest
import java.io.BufferedReader
import java.io.File
import java.io.IOException
import java.io.InputStreamReader
import java.lang.Exception

class MainActivity : AppCompatActivity() {

    fun setFailMessage(message: String) {
        this.setSuccessFailMessage(message, R.color.fail_red)
    }

    fun setSuccessMessage(message: String) {
        this.setSuccessFailMessage(message, R.color.success_green)
    }

    private fun setSuccessFailMessage(message: String, colorId: Int) {
        val successFailMessageView = findViewById<TextView>(R.id.success_fail_message)
        successFailMessageView.setTextColor(getColor(colorId))
        successFailMessageView.text = message

    }
    private fun resetMessage() {
        setSuccessFailMessage("", R.color.success_green)
    }

    private val getFileUriLauncher = registerForActivityResult(ActivityResultContracts.OpenDocument()) {
        Log.i(getString(R.string.widget_log_tag), "$it")
        if (it == null) {
            setFailMessage(getString(R.string.main_activity_fail_no_file_entered))
            return@registerForActivityResult
        }
        val fileContent: String
        try {
            fileContent = readTextFromUri(it)
        } catch (iOException: IOException) {
            Log.w(getString(R.string.widget_log_tag), "Path doesn't exist: $it")
            setFailMessage(getString(R.string.main_activity_fail_could_not_open_file))
            return@registerForActivityResult
        }
        Log.i(getString(R.string.widget_log_tag), "File Content: $fileContent")
        //try {
        updateSomtodayData(fileContent)
        /*} catch (e: Exception) {
            Log.e(getString(R.string.widget_log_tag), e.toString())
            setFailMessage(getString(R.string.main_activity_fail_malformed_file))
            return@registerForActivityResult
        }*/
        saveFile(this, fileContent)
        setSuccessMessage(getString(R.string.main_activity_success_message))
    }

    @Throws(IOException::class)
    private fun readTextFromUri(uri: Uri): String {
        val stringBuilder = StringBuilder()
        contentResolver.openInputStream(uri)?.use { inputStream ->
            BufferedReader(InputStreamReader(inputStream)).use { reader ->
                var line: String? = reader.readLine()
                while (line != null) {
                    stringBuilder.append(line)
                    line = reader.readLine()
                }
            }
        }
        return stringBuilder.toString()
    }



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)
        val addFileButton = findViewById<Button>(R.id.addFileButton)
        addFileButton.setOnClickListener {
            getFileUriLauncher.launch(arrayOf("application/json"))
        }

        val autoUpdateButton = findViewById<Button>(R.id.autoUpdateButton);

        val inputView = findViewById<EditText>(R.id.autoUpdateTextInput)
        autoUpdateButton.setOnClickListener {
            if (inputView.text.isEmpty()) {
                setFailMessage(getString(R.string.main_activity_no_url_input))
            } else {
                sendAutoUpdateRequest(this, inputView.text.toString())
            }
        }
        inputView.text.append(this.getPreferences(Context.MODE_PRIVATE).getString("calendarURL", ""))




    }
}