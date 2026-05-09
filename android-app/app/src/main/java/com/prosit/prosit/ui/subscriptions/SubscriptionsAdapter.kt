package com.prosit.prosit.ui.subscriptions

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.prosit.prosit.api.Subscription
import com.prosit.prosit.databinding.ItemSubscriptionBinding

class SubscriptionsAdapter :
    ListAdapter<Subscription, SubscriptionsAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemSubscriptionBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(private val binding: ItemSubscriptionBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(sub: Subscription) {
            binding.tvName.text     = sub.name
            binding.tvCategory.text = sub.category
                .replace("_", " ")
                .replaceFirstChar { it.uppercase() }
            binding.tvCost.text     = "₹%.0f/mo".format(sub.cost)
            binding.tvStatus.text   = sub.status.replaceFirstChar { it.uppercase() }

            val hours = sub.hours_this_month ?: 0.0
            binding.tvHours.text = if (hours > 0) "%.0f h".format(hours) else "0 h"
            binding.tvCostPerHour.text = if (hours > 0)
                "₹%.0f/hr".format(sub.cost / hours)
            else
                "—/hr"

            when (sub.status) {
                "active" -> {
                    binding.tvStatus.setBackgroundColor(Color.parseColor("#1A3D30"))
                    binding.tvStatus.setTextColor(Color.parseColor("#1D9E75"))
                }
                "paused" -> {
                    binding.tvStatus.setBackgroundColor(Color.parseColor("#2A2D3E"))
                    binding.tvStatus.setTextColor(Color.parseColor("#6B7396"))
                }
                "cancelled" -> {
                    binding.tvStatus.setBackgroundColor(Color.parseColor("#3D1A1A"))
                    binding.tvStatus.setTextColor(Color.parseColor("#E24B4A"))
                }
            }

            val dotColor = when (sub.category) {
                "ai_tools"      -> "#1D9E75"
                "entertainment" -> "#D4537E"
                "learning"      -> "#378ADD"
                "productivity"  -> "#639922"
                else            -> "#6B7396"
            }
            binding.viewDot.setBackgroundColor(Color.parseColor(dotColor))
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<Subscription>() {
        override fun areItemsTheSame(a: Subscription, b: Subscription) = a.id == b.id
        override fun areContentsTheSame(a: Subscription, b: Subscription) = a == b
    }
}