package com.prosit.prosit.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

// ── Auth models ───────────────────────────────────────────────

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)
data class AuthResponse(val token: String, val user: UserData)
data class UserData(val id: Int, val name: String, val email: String)

// kept for backward compat with existing LoginActivity reference
typealias LoginResponse = AuthResponse

// ── Subscription models ───────────────────────────────────────

data class Subscription(
    val id: Int,
    val name: String,
    val category: String,
    val cost: Double,
    val billing_cycle: String,
    val renews_on: String?,
    val status: String,
    val hours_this_month: Double?
)
data class SubscriptionsResponse(val subscriptions: List<Subscription>)

// ── Usage models ──────────────────────────────────────────────

data class UsageRequest(
    val date: String,
    val category: String,
    val minutes: Int,
    val app_name: String,
    val source: String = "android"
)

// ── Goal models ───────────────────────────────────────────────

data class Goal(
    val id: Int,
    val title: String,
    val category: String?,
    val target_hours_per_week: Double?,
    val deadline: String?,
    val progress: Double
)
data class GoalsResponse(val goals: List<Goal>)
data class GoalRequest(
    val title: String,
    val category: String?,
    val target_hours_per_week: Double?,
    val deadline: String?
)

// ── Analytics models ──────────────────────────────────────────

data class Recommendation(val id: String, val severity: String, val title: String, val body: String)
data class AnalyticsSummary(
    val monthlySpend: Double,
    val costPerHour: Double?,
    val unusedCount: Int,
    val activeCount: Int,
    val byCategory: Map<String, Double>,
    val recommendations: List<Recommendation>
)

// ── API interface ─────────────────────────────────────────────

interface PrositApi {

    // Auth
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    // Subscriptions
    @GET("api/subscriptions")
    suspend fun getSubscriptions(@Header("Authorization") token: String): SubscriptionsResponse

    // Usage
    @POST("api/usage")
    suspend fun postUsage(
        @Header("Authorization") token: String,
        @Body request: UsageRequest
    ): Any

    // Goals
    @GET("api/goals")
    suspend fun getGoals(@Header("Authorization") token: String): GoalsResponse

    @POST("api/goals")
    suspend fun postGoal(
        @Header("Authorization") token: String,
        @Body request: GoalRequest
    ): Any

    @DELETE("api/goals/{id}")
    suspend fun deleteGoal(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Any

    // Analytics
    @GET("api/analytics/summary")
    suspend fun getAnalyticsSummary(@Header("Authorization") token: String): AnalyticsSummary
}

// ── Singleton client ──────────────────────────────────────────

object ApiClient {

    // 10.0.2.2 = PC localhost from Android emulator.
    // Change to your Render URL when testing on a physical device:
    // e.g. "https://prosit-backend.onrender.com/"
    private const val BASE_URL = "http://10.0.2.2:5000/"

    val api: PrositApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(PrositApi::class.java)
    }
}
