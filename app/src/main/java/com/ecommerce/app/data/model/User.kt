package com.ecommerce.app.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize

@Parcelize
@Entity(tableName = "users")
data class User(
    @PrimaryKey
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phoneNumber: String?,
    val profileImageUrl: String?,
    val addresses: List<Address> = emptyList(),
    val isEmailVerified: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) : Parcelable

@Parcelize
data class Address(
    val id: String,
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val country: String,
    val isDefault: Boolean = false,
    val latitude: Double? = null,
    val longitude: Double? = null
) : Parcelable