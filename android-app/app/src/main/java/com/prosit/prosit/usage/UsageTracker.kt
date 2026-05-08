package com.prosit.prosit.usage

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Process

// Maps Android package names to PROSIT categories
private val PACKAGE_CATEGORIES: Map<String, String> = mapOf(
    // Entertainment
    "com.spotify.music"           to "entertainment",
    "com.google.android.youtube"  to "entertainment",
    "com.netflix.mediaclient"     to "entertainment",
    "com.discord"                 to "entertainment",
    "com.instagram.android"       to "entertainment",
    "com.twitter.android"         to "entertainment",
    "com.facebook.katana"         to "entertainment",
    "com.snapchat.android"        to "entertainment",
    "com.zhiliaoapp.musically"    to "entertainment",  // TikTok
    "com.mojang.minecraftpe"      to "entertainment",
    "com.epicgames.fortnite"      to "entertainment",
    "com.supercell.clashofclans"  to "entertainment",
    "com.amazon.avod.thirdpartyclient" to "entertainment",  // Prime Video
    "com.disney.disneyplus"       to "entertainment",
    "com.hotstar"                 to "entertainment",

    // Learning
    "com.duolingo"                to "learning",
    "com.udemy.android"           to "learning",
    "com.coursera.app"            to "learning",
    "org.khanacademy.android"     to "learning",
    "com.linkedin.android"        to "learning",
    "com.medium.reader"           to "learning",
    "com.google.android.apps.classroom" to "learning",
    "com.ankidroid.anki"          to "learning",
    "com.ted"                     to "learning",
    "com.sololearn"               to "learning",
    "com.grasshopper.apps"        to "learning",

    // Productivity
    "com.google.android.gm"       to "productivity",
    "com.microsoft.teams"         to "productivity",
    "com.slack"                   to "productivity",
    "com.notion.id"               to "productivity",
    "com.microsoft.office.word"   to "productivity",
    "com.microsoft.office.excel"  to "productivity",
    "com.google.android.calendar" to "productivity",
    "com.google.android.apps.docs" to "productivity",
    "com.google.android.keep"     to "productivity",
    "com.todoist"                 to "productivity",
    "com.evernote"                to "productivity",
    "com.dropbox.android"         to "productivity",
    "com.adobe.reader"            to "productivity",
    "com.google.android.apps.meetings" to "productivity",  // Meet
    "us.zoom.videomeetings"       to "productivity",
    "com.microsoft.office.outlook" to "productivity",
)

private val SYSTEM_PACKAGE_PREFIXES = listOf(
    "com.android.", "android.", "com.google.android.gms",
    "com.google.android.gsf", "com.google.android.inputmethod",
    "com.samsung.android", "com.miui.", "com.oneplus.",
)

data class CategoryUsage(val category: String, val minutes: Int)

class UsageTracker(private val context: Context) {

    fun hasPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    /** Returns aggregated minutes per category for the last [windowMs] milliseconds. */
    fun getUsageByCategory(windowMs: Long = 3_600_000L): List<CategoryUsage> {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_BEST, now - windowMs, now)
            ?: return emptyList()

        val totals = mutableMapOf("learning" to 0L, "entertainment" to 0L, "productivity" to 0L)

        for (stat in stats) {
            val pkg = stat.packageName
            if (isSystemPackage(pkg) || pkg == context.packageName) continue
            val foregroundMs = stat.totalTimeInForeground
            if (foregroundMs < 60_000L) continue

            val category = PACKAGE_CATEGORIES[pkg] ?: "productivity"
            totals[category] = totals.getValue(category) + foregroundMs
        }

        return totals
            .filter { it.value > 0 }
            .map { CategoryUsage(it.key, (it.value / 60_000L).toInt()) }
    }

    private fun isSystemPackage(pkg: String) =
        SYSTEM_PACKAGE_PREFIXES.any { pkg.startsWith(it) }
}
