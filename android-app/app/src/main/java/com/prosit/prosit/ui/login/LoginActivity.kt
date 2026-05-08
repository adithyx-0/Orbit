package com.prosit.prosit.ui.login

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.api.LoginRequest
import com.prosit.prosit.databinding.ActivityLoginBinding
import com.prosit.prosit.ui.subscriptions.SubscriptionsActivity
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // If already logged in, skip straight to subscriptions
        if (getSavedToken() != null) {
            goToSubscriptions()
            return
        }

        binding.btnLogin.setOnClickListener { attemptLogin() }
        binding.tvSignup.setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }

    private fun attemptLogin() {
        val email    = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            return
        }

        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = ApiClient.api.login(LoginRequest(email, password))

                // Save token to SharedPreferences
                saveToken(response.token)
                saveUserName(response.user.name)

                goToSubscriptions()

            } catch (e: Exception) {
                setLoading(false)
                Toast.makeText(
                    this@LoginActivity,
                    "Login failed: ${e.localizedMessage ?: "Check your connection"}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.btnLogin.isEnabled      = !loading
        binding.progressBar.visibility  = if (loading) View.VISIBLE else View.GONE
        binding.etEmail.isEnabled       = !loading
        binding.etPassword.isEnabled    = !loading
    }

    private fun goToSubscriptions() {
        startActivity(Intent(this, SubscriptionsActivity::class.java))
        finish()
    }

    // ── Token storage ─────────────────────────────────────────
    private fun saveToken(token: String) {
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .edit().putString("jwt_token", token).apply()
    }

    private fun saveUserName(name: String) {
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .edit().putString("user_name", name).apply()
    }

    private fun getSavedToken(): String? {
        return getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("jwt_token", null)
    }
}