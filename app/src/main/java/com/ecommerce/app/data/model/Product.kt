package com.ecommerce.app.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize

@Parcelize
@Entity(tableName = "products")
data class Product(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val originalPrice: Double? = null,
    val currency: String = "USD",
    val categoryId: String,
    val images: List<String>,
    val thumbnail: String,
    val brand: String?,
    val sku: String,
    val stock: Int,
    val rating: Float = 0f,
    val reviewCount: Int = 0,
    val specifications: Map<String, String> = emptyMap(),
    val tags: List<String> = emptyList(),
    val isActive: Boolean = true,
    val isFeatured: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) : Parcelable {
    
    val discountPercentage: Int
        get() = originalPrice?.let {
            ((it - price) / it * 100).toInt()
        } ?: 0
    
    val isOnSale: Boolean
        get() = originalPrice != null && originalPrice > price
}

@Parcelize
@Entity(tableName = "categories")
data class Category(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val parentCategoryId: String? = null,
    val isActive: Boolean = true,
    val sortOrder: Int = 0
) : Parcelable