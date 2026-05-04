package com.prosit.prosit.ui.subscriptions

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.databinding.ActivitySubscriptionsBinding
import com.prosit.prosit.ui.login.LoginActivity
import kotlinx.coroutines.launch

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

        loadSubscriptions()
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
                Toast.makeText(
                    this@SubscriptionsActivity,
                    "Could not load subscriptions: ${e.localizedMessage}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun logout() {
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .edit().clear().apply()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    private fun getToken(): String? =
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("jwt_token", null)
}