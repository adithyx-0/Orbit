package com.prosit.prosit.usage

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.api.UsageRequest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class UsageUploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("jwt_token", null) ?: return Result.success()

        val tracker = UsageTracker(applicationContext)
        if (!tracker.hasPermission()) return Result.success()

        val usages = tracker.getUsageByCategory()
        if (usages.isEmpty()) return Result.success()

        val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val authHeader = "Bearer $token"

        for (usage in usages) {
            try {
                ApiClient.api.postUsage(
                    authHeader,
                    UsageRequest(
                        date = today,
                        category = usage.category,
                        minutes = usage.minutes,
                        app_name = "android",
                        source = "android"
                    )
                )
            } catch (_: Exception) {
                // Don't fail the whole worker if one record fails
            }
        }

        return Result.success()
    }
}
