package com.prosit.prosit.ui.goals

import android.animation.ObjectAnimator
import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.prosit.prosit.api.Goal
import com.prosit.prosit.databinding.ItemGoalBinding

class GoalsAdapter(private val onDelete: (Goal) -> Unit) :
    ListAdapter<Goal, GoalsAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemGoalBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(private val binding: ItemGoalBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(goal: Goal) {
            binding.tvTitle.text = goal.title

            val cat = goal.category?.replaceFirstChar { it.uppercase() } ?: "General"
            binding.tvCategory.text = cat

            val catColor = when (goal.category) {
                "learning"      -> "#378ADD"
                "entertainment" -> "#D4537E"
                "productivity"  -> "#639922"
                else            -> "#6B7396"
            }
            binding.tvCategory.setTextColor(Color.parseColor(catColor))

            val target   = goal.target_hours_per_week ?: 0.0
            val progress = goal.progress.toInt().coerceIn(0, 100)
            binding.progressBar.progress = 0
            ObjectAnimator.ofInt(binding.progressBar, "progress", 0, progress).apply {
                duration    = 700
                interpolator = DecelerateInterpolator()
                start()
            }

            val progressHrs = (target * progress / 100.0)
            binding.tvProgress.text = if (target > 0)
                "%.1f / %.0f hrs/week".format(progressHrs, target)
            else
                "$progress% complete"

            binding.tvDeadline.text = goal.deadline?.let { "Due $it" } ?: ""

            binding.root.setOnLongClickListener {
                onDelete(goal)
                true
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<Goal>() {
        override fun areItemsTheSame(a: Goal, b: Goal) = a.id == b.id
        override fun areContentsTheSame(a: Goal, b: Goal) = a == b
    }
}
