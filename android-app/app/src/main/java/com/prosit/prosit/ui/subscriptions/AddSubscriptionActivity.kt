package com.prosit.prosit.ui.subscriptions

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.api.SubscriptionRequest
import com.prosit.prosit.databinding.ActivityAddSubscriptionBinding
import kotlinx.coroutines.launch

class AddSubscriptionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddSubscriptionBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddSubscriptionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.root.alpha = 0f
        binding.root.translationY = 60f
        binding.root.animate().alpha(1f).translationY(0f).setDuration(300).start()

        val categories = listOf("Entertainment", "Learning", "Productivity", "AI Tools", "Other")
        val cycles     = listOf("Monthly", "Yearly", "Weekly")

        binding.spinnerCategory.setAdapter(
            ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, categories)
        )
        binding.spinnerCycle.setAdapter(
            ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, cycles)
        )

        binding.btnBack.setOnClickListener { finish() }
        binding.btnAdd.setOnClickListener { submit() }
    }

    private fun submit() {
        val name     = binding.etName.text.toString().trim()
        val costStr  = binding.etCost.text.toString().trim()
        val category = binding.spinnerCategory.text.toString().trim()
        val cycle    = binding.spinnerCycle.text.toString().trim()
        val hoursStr = binding.etHours.text.toString().trim()
        val renewsOn = binding.etRenewsOn.text.toString().trim().ifEmpty { null }

        if (name.isEmpty() || costStr.isEmpty()) {
            Toast.makeText(this, "Name and cost are required", Toast.LENGTH_SHORT).show()
            return
        }
        val cost = costStr.toDoubleOrNull() ?: run {
            Toast.makeText(this, "Invalid cost", Toast.LENGTH_SHORT).show()
            return
        }

        val req = SubscriptionRequest(
            name             = name,
            cost             = cost,
            category         = category.lowercase().replace(" ", "_").ifEmpty { "other" },
            billing_cycle    = cycle.lowercase().ifEmpty { "monthly" },
            hours_this_month = hoursStr.toDoubleOrNull(),
            renews_on        = renewsOn
        )

        binding.btnAdd.isEnabled = false
        val token = "Bearer ${getSharedPreferences("prosit_prefs", MODE_PRIVATE).getString("jwt_token", "")}"

        lifecycleScope.launch {
            try {
                ApiClient.api.addSubscription(token, req)
                Toast.makeText(this@AddSubscriptionActivity, "Subscription added!", Toast.LENGTH_SHORT).show()
                finish()
            } catch (e: Exception) {
                binding.btnAdd.isEnabled = true
                Toast.makeText(
                    this@AddSubscriptionActivity,
                    "Error: ${e.localizedMessage ?: "Check your connection"}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}
