package com.prosit.prosit.ui.splash

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.OvershootInterpolator
import androidx.appcompat.app.AppCompatActivity
import com.prosit.prosit.databinding.ActivitySplashBinding
import com.prosit.prosit.ui.login.LoginActivity
import com.prosit.prosit.ui.main.MainActivity

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)
        animateSplash()
    }

    private fun animateSplash() {
        val logoScaleX = ObjectAnimator.ofFloat(binding.ivLogo, "scaleX", 0.5f, 1f).apply {
            interpolator = OvershootInterpolator(1.5f)
        }
        val logoScaleY = ObjectAnimator.ofFloat(binding.ivLogo, "scaleY", 0.5f, 1f).apply {
            interpolator = OvershootInterpolator(1.5f)
        }
        val logoAlpha = ObjectAnimator.ofFloat(binding.ivLogo, "alpha", 0f, 1f).apply {
            duration = 400
        }
        val glowAlpha = ObjectAnimator.ofFloat(binding.viewGlow, "alpha", 0f, 0.6f)

        val logoSet = AnimatorSet().apply {
            playTogether(logoScaleX, logoScaleY, logoAlpha, glowAlpha)
            duration = 600
        }

        val nameAlpha    = ObjectAnimator.ofFloat(binding.tvAppName, "alpha", 0f, 1f)
        val taglineAlpha = ObjectAnimator.ofFloat(binding.tvTagline, "alpha", 0f, 1f)
        val nameSlide    = ObjectAnimator.ofFloat(binding.tvAppName, "translationY", 20f, 0f)
        val tagSlide     = ObjectAnimator.ofFloat(binding.tvTagline, "translationY", 20f, 0f)
        val interp       = AccelerateDecelerateInterpolator()
        listOf(nameAlpha, taglineAlpha, nameSlide, tagSlide).forEach {
            it.duration     = 400
            it.interpolator = interp
        }
        val textSet = AnimatorSet().apply { playTogether(nameAlpha, taglineAlpha, nameSlide, tagSlide) }

        val barAlpha = ObjectAnimator.ofFloat(binding.progressBar, "alpha", 0f, 1f).apply {
            duration = 300
        }

        AnimatorSet().apply {
            playSequentially(logoSet, textSet, barAlpha)
            start()
        }

        binding.root.postDelayed({
            val dest = if (getSavedToken() != null) {
                Intent(this, MainActivity::class.java)
            } else {
                Intent(this, LoginActivity::class.java)
            }
            startActivity(dest)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }, 2200)
    }

    private fun getSavedToken(): String? =
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("jwt_token", null)
}
