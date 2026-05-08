package com.prosit.prosit.ui.goals

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.prosit.prosit.api.ApiClient
import com.prosit.prosit.api.GoalRequest
import com.prosit.prosit.databinding.ActivityGoalsBinding
import com.prosit.prosit.ui.login.LoginActivity
import kotlinx.coroutines.launch
import android.content.Intent

class GoalsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGoalsBinding
    private lateinit var adapter: GoalsAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGoalsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = GoalsAdapter(onDelete = { goal ->
            AlertDialog.Builder(this)
                .setTitle("Delete goal?")
                .setMessage("\"${goal.title}\" will be permanently removed.")
                .setPositiveButton("Delete") { _, _ -> deleteGoal(goal.id) }
                .setNegativeButton("Cancel", null)
                .show()
        })

        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter

        binding.btnAddGoal.setOnClickListener { showAddGoalDialog() }

        loadGoals()
    }

    private fun loadGoals() {
        val token = getToken() ?: return redirectToLogin()

        binding.progressBar.visibility  = View.VISIBLE
        binding.recyclerView.visibility = View.GONE
        binding.tvEmpty.visibility      = View.GONE

        lifecycleScope.launch {
            try {
                val response = ApiClient.api.getGoals("Bearer $token")

                binding.progressBar.visibility = View.GONE

                if (response.goals.isEmpty()) {
                    binding.tvEmpty.visibility = View.VISIBLE
                } else {
                    binding.recyclerView.visibility = View.VISIBLE
                    adapter.submitList(response.goals)
                }
            } catch (e: Exception) {
                binding.progressBar.visibility = View.GONE
                toast("Could not load goals: ${e.localizedMessage}")
            }
        }
    }

    private fun showAddGoalDialog() {
        val ctx = this
        val layout = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(64, 32, 64, 0)
        }

        val etTitle = EditText(ctx).apply { hint = "Goal title (required)" }
        val categories = arrayOf("learning", "productivity", "entertainment")
        val spinner = Spinner(ctx).apply {
            adapter = ArrayAdapter(ctx, android.R.layout.simple_spinner_dropdown_item, categories)
        }
        val etHours = EditText(ctx).apply {
            hint = "Target hours/week (e.g. 5)"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
        }
        val etDeadline = EditText(ctx).apply { hint = "Deadline (YYYY-MM-DD, optional)" }

        layout.addView(etTitle)
        layout.addView(spinner)
        layout.addView(etHours)
        layout.addView(etDeadline)

        AlertDialog.Builder(ctx)
            .setTitle("New Goal")
            .setView(layout)
            .setPositiveButton("Add") { _, _ ->
                val title = etTitle.text.toString().trim()
                if (title.isEmpty()) {
                    toast("Title is required")
                    return@setPositiveButton
                }
                val hoursText = etHours.text.toString().trim()
                val hours = hoursText.toDoubleOrNull()
                val deadline = etDeadline.text.toString().trim().ifEmpty { null }
                val category = categories[spinner.selectedItemPosition]

                createGoal(GoalRequest(title, category, hours, deadline))
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun createGoal(request: GoalRequest) {
        val token = getToken() ?: return redirectToLogin()

        lifecycleScope.launch {
            try {
                ApiClient.api.postGoal("Bearer $token", request)
                loadGoals()
            } catch (e: Exception) {
                toast("Failed to add goal: ${e.localizedMessage}")
            }
        }
    }

    private fun deleteGoal(id: Int) {
        val token = getToken() ?: return redirectToLogin()

        lifecycleScope.launch {
            try {
                ApiClient.api.deleteGoal("Bearer $token", id)
                loadGoals()
            } catch (e: Exception) {
                toast("Failed to delete goal: ${e.localizedMessage}")
            }
        }
    }

    private fun getToken() =
        getSharedPreferences("prosit_prefs", Context.MODE_PRIVATE)
            .getString("jwt_token", null)

    private fun redirectToLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    private fun toast(msg: String) =
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
}
