package com.prosit.prosit.ui.subscriptions

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Process
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.databinding.ActivitySubscriptionsBinding
import com.prosit.prosit.ui.goals.GoalsActivity
import com.prosit.prosit.ui.login.LoginActivity
import com.prosit.prosit.usage.UsageUploadWorker
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class SubscriptionsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySubscriptionsBinding
    private lateinit var adapter: SubscriptionsAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySubscriptionsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val name = getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("user_name", "User")
        binding.tvGreeting.text = "Hello, $name"

        adapter = SubscriptionsAdapter()
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter

        binding.btnLogout.setOnClickListener { logout() }
        binding.btnGoals.setOnClickListener {
            startActivity(Intent(this, GoalsActivity::class.java))
        }

        loadSubscriptions()
        scheduleUsageUpload()
        promptUsagePermissionIfNeeded()
    }

    private fun loadSubscriptions() {
        val token = getToken() ?: run { logout(); return }

        binding.progressBar.visibility  = View.VISIBLE
        binding.recyclerView.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val response = ApiClient.api.getSubscriptions("Bearer $token")

                binding.progressBar.visibility  = View.GONE
                binding.recyclerView.visibility = View.VISIBLE

                if (response.subscriptions.isEmpty()) {
                    binding.tvEmpty.visibility = View.VISIBLE
                } else {
                    binding.tvEmpty.visibility = View.GONE
                    adapter.submitList(response.subscriptions)
                    val total = response.subscriptions
                        .filter { it.status == "active" }
                        .sumOf { it.cost }
                    binding.tvTotalSpend.text = "Monthly spend: ₹%.0f".format(total)
                }
            } catch (e: Exception) {
                binding.progressBar.visibility = View.GONE
                Toast.makeText(this@SubscriptionsActivity,
                    "Could not load subscriptions: ${e.localizedMessage}",
                    Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun scheduleUsageUpload() {
        val request = PeriodicWorkRequestBuilder<UsageUploadWorker>(1, TimeUnit.HOURS)
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "prosit_usage_upload",
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )
    }

    private fun promptUsagePermissionIfNeeded() {
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), packageName
        )
        if (mode == AppOpsManager.MODE_ALLOWED) return

        AlertDialog.Builder(this)
            .setTitle("Enable Usage Tracking")
            .setMessage("Prosit tracks which apps you use to calculate cost-per-hour insights.\n\nGrant \"Usage access\" permission in the next screen.")
            .setPositiveButton("Open Settings") { _, _ ->
                startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                    data = Uri.fromParts("package", packageName, null)
                })
            }
            .setNegativeButton("Skip", null)
            .show()
    }

    private fun logout() {
        WorkManager.getInstance(this).cancelUniqueWork("prosit_usage_upload")
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE).edit().clear().apply()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    private fun getToken(): String? =
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("jwt_token", null)
}
