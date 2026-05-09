package com.prosit.prosit.ui.main

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.prosit.prosit.R
import com.prosit.prosit.databinding.ActivityMainBinding
import com.prosit.prosit.ui.dashboard.DashboardFragment
import com.prosit.prosit.ui.goals.GoalsFragment
import com.prosit.prosit.ui.login.LoginActivity
import com.prosit.prosit.ui.subscriptions.SubscriptionsFragment

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var currentTabId = R.id.nav_dashboard

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (savedInstanceState == null) {
            loadFragment(DashboardFragment(), animate = false)
        }

        binding.bottomNav.setOnItemSelectedListener { item ->
            if (item.itemId == currentTabId) return@setOnItemSelectedListener true
            currentTabId = item.itemId
            when (item.itemId) {
                R.id.nav_dashboard     -> loadFragment(DashboardFragment())
                R.id.nav_subscriptions -> loadFragment(SubscriptionsFragment())
                R.id.nav_goals         -> loadFragment(GoalsFragment())
            }
            true
        }
    }

    private fun loadFragment(fragment: Fragment, animate: Boolean = true) {
        val tx = supportFragmentManager.beginTransaction()
        if (animate) {
            tx.setCustomAnimations(
                R.anim.fade_in, R.anim.fade_out,
                R.anim.fade_in, R.anim.fade_out
            )
        }
        tx.replace(R.id.fragmentContainer, fragment).commit()
    }

    fun logout() {
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE).edit().clear().apply()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    fun getToken(): String =
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("jwt_token", "") ?: ""

    fun getUserName(): String =
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("user_name", "User") ?: "User"
}
