package com.prosit.prosit.ui.goals

import android.graphics.Color
import android.os.Bundle
import android.text.InputType
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.api.Goal
import com.prosit.prosit.api.GoalRequest
import com.prosit.prosit.databinding.FragmentGoalsBinding
import com.prosit.prosit.ui.main.MainActivity
import kotlinx.coroutines.launch

class GoalsFragment : Fragment() {

    private var _binding: FragmentGoalsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: GoalsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentGoalsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = GoalsAdapter(::confirmDelete)
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.swipeRefresh.setColorSchemeColors(Color.parseColor("#1D9E75"))
        binding.swipeRefresh.setOnRefreshListener { loadData() }

        binding.fab.setOnClickListener { showAddDialog() }

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
                val response = ApiClient.api.getGoals(token)
                if (_binding == null) return@launch
                binding.shimmerLayout.stopShimmer()
                binding.shimmerLayout.visibility = View.GONE

                if (response.goals.isEmpty()) {
                    binding.emptyState.visibility = View.VISIBLE
                    binding.tvGoalCount.text = "No goals"
                } else {
                    binding.recyclerView.visibility = View.VISIBLE
                    adapter.submitList(response.goals)
                    binding.tvGoalCount.text = "${response.goals.size} active goals"
                }
            } catch (_: Exception) {
                if (_binding != null) {
                    binding.shimmerLayout.stopShimmer()
                    binding.shimmerLayout.visibility = View.GONE
                    binding.emptyState.visibility    = View.VISIBLE
                    binding.tvGoalCount.text = "Error loading"
                }
            } finally {
                if (_binding != null) binding.swipeRefresh.isRefreshing = false
            }
        }
    }

    private fun showAddDialog() {
        val ctx = requireContext()
        val dp  = resources.displayMetrics.density.toInt()
        val pad = 20 * dp

        val etTitle    = EditText(ctx).apply { hint = "Goal title" }
        val etCategory = EditText(ctx).apply { hint = "Category (learning / productivity / ...)" }
        val etHours    = EditText(ctx).apply {
            hint      = "Target hours/week (e.g. 5)"
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
        }
        val etDeadline = EditText(ctx).apply { hint = "Deadline YYYY-MM-DD (optional)" }

        val container = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(pad, pad, pad, 0)
            addView(etTitle)
            addView(etCategory)
            addView(etHours)
            addView(etDeadline)
        }

        AlertDialog.Builder(ctx, com.google.android.material.R.style.ThemeOverlay_MaterialComponents_Dialog_Alert)
            .setTitle("New Goal")
            .setView(container)
            .setPositiveButton("Add") { _, _ ->
                val title    = etTitle.text.toString().trim()
                val category = etCategory.text.toString().trim().ifEmpty { null }
                val hours    = etHours.text.toString().toDoubleOrNull()
                val deadline = etDeadline.text.toString().trim().ifEmpty { null }
                if (title.isNotEmpty()) postGoal(GoalRequest(title, category, hours, deadline))
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun postGoal(req: GoalRequest) {
        val token = "Bearer ${(activity as? MainActivity)?.getToken()}"
        lifecycleScope.launch {
            try { ApiClient.api.postGoal(token, req) } catch (_: Exception) {}
            loadData()
        }
    }

    private fun confirmDelete(goal: Goal) {
        AlertDialog.Builder(requireContext(), com.google.android.material.R.style.ThemeOverlay_MaterialComponents_Dialog_Alert)
            .setTitle("Delete Goal")
            .setMessage("Remove \"${goal.title}\"?")
            .setPositiveButton("Delete") { _, _ -> deleteGoal(goal.id) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun deleteGoal(id: Int) {
        val token = "Bearer ${(activity as? MainActivity)?.getToken()}"
        lifecycleScope.launch {
            try { ApiClient.api.deleteGoal(token, id) } catch (_: Exception) {}
            loadData()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
