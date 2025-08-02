import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot 
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { Product, Category, SearchFilters, PaginatedResponse } from '@/types';

export const productService = {
  async getProducts(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Product>> {
    try {
      const productsRef = collection(firestore, 'products');
      let q = query(
        productsRef,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (page > 1) {
        // For pagination, you would need to store the last document from previous page
        // This is a simplified version
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      return {
        data: products,
        total: products.length,
        page,
        limit: pageSize,
        hasMore: products.length === pageSize,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return mock data for demo purposes
      return this.getMockProducts(page, pageSize);
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(firestore, 'products');
      const q = query(
        productsRef,
        where('isFeatured', '==', true),
        where('isActive', '==', true),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      return products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return this.getMockFeaturedProducts();
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const categoriesRef = collection(firestore, 'categories');
      const q = query(
        categoriesRef,
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );

      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getMockCategories();
    }
  },

  async getProductById(productId: string): Promise<Product> {
    try {
      const productDoc = await getDoc(doc(firestore, 'products', productId));
      
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      return {
        id: productDoc.id,
        ...productDoc.data(),
      } as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return this.getMockProduct(productId);
    }
  },

  async searchProducts(
    searchQuery: string, 
    filters?: SearchFilters, 
    page: number = 1
  ): Promise<PaginatedResponse<Product>> {
    try {
      const productsRef = collection(firestore, 'products');
      let q = query(
        productsRef,
        where('isActive', '==', true),
        orderBy('name'),
        limit(20)
      );

      // Apply filters
      if (filters?.category) {
        q = query(q, where('categoryId', '==', filters.category));
      }

      if (filters?.minPrice && filters?.maxPrice) {
        q = query(q, where('price', '>=', filters.minPrice), where('price', '<=', filters.maxPrice));
      }

      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Filter by search query (client-side for simplicity)
      if (searchQuery) {
        products = products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      return {
        data: products,
        total: products.length,
        page,
        limit: 20,
        hasMore: false,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return this.getMockSearchResults(searchQuery);
    }
  },

  async getProductsByCategory(categoryId: string, page: number = 1): Promise<PaginatedResponse<Product>> {
    try {
      const productsRef = collection(firestore, 'products');
      const q = query(
        productsRef,
        where('categoryId', '==', categoryId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      return {
        data: products,
        total: products.length,
        page,
        limit: 20,
        hasMore: products.length === 20,
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return this.getMockProductsByCategory(categoryId);
    }
  },

  // Mock data methods for demo purposes
  getMockProducts(page: number, pageSize: number): PaginatedResponse<Product> {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 299.99,
        originalPrice: 399.99,
        currency: 'USD',
        categoryId: 'electronics',
        images: ['https://via.placeholder.com/300x300?text=Headphones'],
        thumbnail: 'https://via.placeholder.com/300x300?text=Headphones',
        brand: 'AudioTech',
        sku: 'AT-WH-001',
        stock: 25,
        rating: 4.5,
        reviewCount: 128,
        specifications: { 'Battery Life': '30 hours', 'Weight': '250g' },
        tags: ['wireless', 'noise-cancellation', 'premium'],
        isActive: true,
        isFeatured: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        name: 'Smart Fitness Watch',
        description: 'Track your fitness goals with this smart watch',
        price: 199.99,
        currency: 'USD',
        categoryId: 'wearables',
        images: ['https://via.placeholder.com/300x300?text=Watch'],
        thumbnail: 'https://via.placeholder.com/300x300?text=Watch',
        brand: 'FitTech',
        sku: 'FT-SW-002',
        stock: 50,
        rating: 4.2,
        reviewCount: 89,
        specifications: { 'Battery Life': '7 days', 'Water Resistance': 'IP68' },
        tags: ['fitness', 'smart', 'health'],
        isActive: true,
        isFeatured: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    return {
      data: mockProducts,
      total: mockProducts.length,
      page,
      limit: pageSize,
      hasMore: false,
    };
  },

  getMockFeaturedProducts(): Product[] {
    return this.getMockProducts(1, 10).data;
  },

  getMockCategories(): Category[] {
    return [
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        imageUrl: 'https://via.placeholder.com/100x100?text=Electronics',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'fashion',
        name: 'Fashion',
        description: 'Clothing and accessories',
        imageUrl: 'https://via.placeholder.com/100x100?text=Fashion',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'home',
        name: 'Home & Garden',
        description: 'Home improvement and garden items',
        imageUrl: 'https://via.placeholder.com/100x100?text=Home',
        isActive: true,
        sortOrder: 3,
      },
    ];
  },

  getMockProduct(productId: string): Product {
    return this.getMockProducts(1, 1).data[0];
  },

  getMockSearchResults(query: string): PaginatedResponse<Product> {
    return this.getMockProducts(1, 5);
  },

  getMockProductsByCategory(categoryId: string): PaginatedResponse<Product> {
    return this.getMockProducts(1, 10);
  },
};