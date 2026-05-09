package com.prosit.prosit.ui.dashboard

import android.animation.ValueAnimator
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.prosit.prosit.api.AnalyticsSummary
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.databinding.FragmentDashboardBinding
import com.prosit.prosit.databinding.ItemRecommendationBinding
import com.prosit.prosit.ui.main.MainActivity
import kotlinx.coroutines.launch
import java.util.Calendar

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val main = activity as? MainActivity
        binding.tvUserName.text = main?.getUserName() ?: "User"
        binding.tvGreeting.text = greeting()

        binding.btnLogout.setOnClickListener { main?.logout() }

        binding.swipeRefresh.setColorSchemeColors(Color.parseColor("#1D9E75"))
        binding.swipeRefresh.setOnRefreshListener { loadData() }

        loadData()
    }

    private fun loadData() {
        val token = "Bearer ${(activity as? MainActivity)?.getToken()}"
        binding.loadingState.visibility = View.VISIBLE
        binding.recommendationsContainer.removeAllViews()
        binding.tvNoRecs.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val summary = ApiClient.api.getAnalyticsSummary(token)
                if (_binding == null) return@launch
                binding.loadingState.visibility = View.GONE
                populateSummary(summary)
            } catch (_: Exception) {
                if (_binding != null) binding.loadingState.visibility = View.GONE
            } finally {
                if (_binding != null) binding.swipeRefresh.isRefreshing = false
            }
        }
    }

    private fun populateSummary(s: AnalyticsSummary) {
        animateCountTo(binding.tvActiveSubs, s.activeCount)
        animateCountTo(binding.tvUnused, s.unusedCount)
        animateCountTo(binding.tvTotalSubs, s.activeCount + s.unusedCount)
        animateMoneyTo(binding.tvMonthlySpend, s.monthlySpend)

        binding.tvCostPerHour.text = s.costPerHour?.let { "₹%.0f".format(it) } ?: "—"

        if (s.recommendations.isEmpty()) {
            binding.tvNoRecs.visibility = View.VISIBLE
        } else {
            s.recommendations.forEach { rec ->
                val rb = ItemRecommendationBinding.inflate(
                    layoutInflater, binding.recommendationsContainer, true
                )
                rb.tvRecTitle.text = rec.title
                rb.tvRecBody.text  = rec.body
                rb.viewSeverityBar.setBackgroundColor(
                    when (rec.severity) {
                        "high"   -> Color.parseColor("#E24B4A")
                        "medium" -> Color.parseColor("#E8A83A")
                        else     -> Color.parseColor("#1D9E75")
                    }
                )
                rb.root.alpha = 0f
                rb.root.translationY = 24f
                rb.root.animate()
                    .alpha(1f).translationY(0f)
                    .setDuration(350)
                    .setInterpolator(DecelerateInterpolator())
                    .start()
            }
        }
    }

    private fun animateCountTo(tv: android.widget.TextView, target: Int) {
        ValueAnimator.ofInt(0, target).apply {
            duration = 800
            interpolator = DecelerateInterpolator()
            addUpdateListener { tv.text = (it.animatedValue as Int).toString() }
        }.start()
    }

    private fun animateMoneyTo(tv: android.widget.TextView, target: Double) {
        ValueAnimator.ofFloat(0f, target.toFloat()).apply {
            duration = 900
            interpolator = DecelerateInterpolator()
            addUpdateListener { tv.text = "₹%.0f".format(it.animatedValue as Float) }
        }.start()
    }

    private fun greeting(): String = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
        in 5..11  -> "Good morning,"
        in 12..17 -> "Good afternoon,"
        in 18..21 -> "Good evening,"
        else      -> "Good night,"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
