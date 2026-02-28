import { defineStore } from 'pinia'

// 商品类型接口
interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  icon: string
  sku?: string
  stock?: number
  features?: string[]
  details?: string[]
}

// 商品列表 Store
export const useProductStore = defineStore('products', {
  state: () => ({
    products: [
      {
        id: 1,
        name: '精品套装 A',
        description: '高品质材料，精工制作，耐用美观',
        price: 1299,
        category: '套装系列',
        icon: '📦',
        sku: 'SKU-001',
        stock: 100,
        features: [
          '采用优质环保材料，安全无害',
          '精湛工艺，细节完美',
          '时尚设计，引领潮流',
          '多重质检，品质保证'
        ]
      },
      {
        id: 2,
        name: '豪华礼盒 B',
        description: '精美礼盒包装，送礼首选',
        price: 899,
        category: '礼盒系列',
        icon: '🎁',
        sku: 'SKU-002',
        stock: 50,
        features: [
          '精美礼盒包装，档次感十足',
          '内容丰富，选择多样',
          '适合各类场合送礼',
          '提供定制服务'
        ]
      },
      {
        id: 3,
        name: '经典单品 C',
        description: '简约设计，经典永恒',
        price: 599,
        category: '单品系列',
        icon: '⭐',
        sku: 'SKU-003',
        stock: 200,
        features: [
          '简约设计，百搭时尚',
          '经典款式，永不过时',
          '优质材料，耐用持久',
          '性价比超高'
        ]
      },
      {
        id: 4,
        name: '限量版 D',
        description: '限量发售，珍贵稀有',
        price: 2499,
        category: '限量版',
        icon: '🏆',
        sku: 'SKU-004',
        stock: 20,
        features: [
          '限量发售，数量有限',
          '独特设计，独一无二',
          '收藏价值高',
          '附赠收藏证书'
        ]
      }
    ] as Product[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getProductById: (state) => (id: number) => {
      return state.products.find(p => p.id === id)
    },
    getProductsByCategory: (state) => (category: string) => {
      return state.products.filter(p => p.category === category)
    },
    categories: (state) => {
      return [...new Set(state.products.map(p => p.category))]
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        // 实际项目中这里应该调用API
        // const response = await fetch('/api/products')
        // this.products = await response.json()
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        this.error = '获取商品列表失败'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id: number) {
      this.loading = true
      this.error = null
      try {
        // 实际项目中这里应该调用API
        // const response = await fetch(`/api/products/${id}`)
        // return await response.json()
        await new Promise(resolve => setTimeout(resolve, 300))
        return this.products.find(p => p.id === id)
      } catch (err) {
        this.error = '获取商品详情失败'
        console.error(err)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
