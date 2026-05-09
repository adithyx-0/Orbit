package com.prosit.prosit.ui.subscriptions

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.databinding.FragmentSubscriptionsBinding
import com.prosit.prosit.ui.main.MainActivity
import kotlinx.coroutines.launch

class SubscriptionsFragment : Fragment() {

    private var _binding: FragmentSubscriptionsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: SubscriptionsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSubscriptionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = SubscriptionsAdapter()
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.swipeRefresh.setColorSchemeColors(Color.parseColor("#1D9E75"))
        binding.swipeRefresh.setOnRefreshListener { loadData() }

        binding.fab.setOnClickListener {
            startActivity(Intent(requireContext(), AddSubscriptionActivity::class.java))
        }

        loadData()
    }

    override fun onResume() {
        super.onResume()
        loadData()
    }

    private fun loadData() {
        val token = "Bearer ${(activity as? MainActivity)?.getToken()}"
        binding.shimmerLayout.startShimmer()
        binding.shimmerLayout.visibility = View.VISIBLE
        binding.recyclerView.visibility  = View.GONE
        binding.emptyState.visibility    = View.GONE

        lifecycleScope.launch {
            try {
                val response = ApiClient.api.getSubscriptions(token)
                if (_binding == null) return@launch
                binding.shimmerLayout.stopShimmer()
                binding.shimmerLayout.visibility = View.GONE

                if (response.subscriptions.isEmpty()) {
                    binding.emptyState.visibility = View.VISIBLE
                    binding.tvSubCount.text = "0 services"
                } else {
                    binding.recyclerView.visibility = View.VISIBLE
                    adapter.submitList(response.subscriptions)
                    val active = response.subscriptions.count { it.status == "active" }
                    binding.tvSubCount.text =
                        "${response.subscriptions.size} services · $active active"
                }
            } catch (_: Exception) {
                if (_binding != null) {
                    binding.shimmerLayout.stopShimmer()
                    binding.shimmerLayout.visibility = View.GONE
                    binding.emptyState.visibility    = View.VISIBLE
                    binding.tvSubCount.text = "Error loading"
                }
            } finally {
                if (_binding != null) binding.swipeRefresh.isRefreshing = false
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
