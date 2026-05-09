package com.prosit.prosit.ui.login

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.api.RegisterRequest
import com.prosit.prosit.databinding.ActivitySignupBinding
import com.prosit.prosit.ui.main.MainActivity
import kotlinx.coroutines.launch

class SignupActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySignupBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSignup.setOnClickListener { attemptSignup() }
        binding.tvLogin.setOnClickListener { finish() }
    }

    private fun attemptSignup() {
        val name     = binding.etName.text.toString().trim()
        val email    = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            return
        }
        if (password.length < 6) {
            Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
            return
        }

        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = ApiClient.api.register(RegisterRequest(name, email, password))

                getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE).edit()
                    .putString("jwt_token", response.token)
                    .putString("user_name", response.user.name)
                    .apply()

                startActivity(Intent(this@SignupActivity, MainActivity::class.java))
                finish()

            } catch (e: Exception) {
                setLoading(false)
                val msg = e.localizedMessage ?: "Registration failed"
                Toast.makeText(this@SignupActivity, msg, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.btnSignup.isEnabled     = !loading
        binding.progressBar.visibility  = if (loading) View.VISIBLE else View.GONE
        binding.etName.isEnabled        = !loading
        binding.etEmail.isEnabled       = !loading
        binding.etPassword.isEnabled    = !loading
    }
}
