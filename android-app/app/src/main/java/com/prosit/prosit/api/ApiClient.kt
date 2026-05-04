package com.prosit.prosit.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

// ── Data models ──────────────────────────────────────────────

data class LoginRequest(val email: String, val password: String)

data class LoginResponse(val token: String, val user: UserData)

data class UserData(val id: String, val name: String, val email: String)

data class Subscription(
    val id: String,
    val name: String,
    val category: String,
    val cost: Double,
    val billing_cycle: String,
    val renewal_date: String?,
    val status: String
)

data class SubscriptionsResponse(val subscriptions: List<Subscription>)

// ── API interface ─────────────────────────────────────────────

interface PrositApi {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @GET("api/subscriptions")
    suspend fun getSubscriptions(
        @Header("Authorization") token: String
    ): SubscriptionsResponse
}

// ── Singleton client ──────────────────────────────────────────

object ApiClient {

    // 10.0.2.2 = your PC's localhost when running on Android emulator
    private const val BASE_URL = "http://10.0.2.2:5000/"

    val api: PrositApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(PrositApi::class.java)
    }
}