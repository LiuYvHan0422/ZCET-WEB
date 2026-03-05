<template>
  <div class="products-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">商品管理</h1>
        <p class="page-subtitle">管理您的商品列表，包括添加、编辑、删除商品。</p>
      </div>
      <router-link to="/products/add" class="btn btn-primary">➕ 添加商品</router-link>
    </div>

    <div class="data-table-container">
      <div class="table-header">
        <div class="table-title">📦 商品列表</div>
        <div class="table-actions">
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              placeholder="搜索商品名称..."
              v-model="keyword"
              @keyup.enter="handleSearch"
            />
            <select class="filter-select" v-model="filters.category" @change="handleSearch">
              <option value="">全部分类</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select class="filter-select" v-model="filters.status" @change="handleSearch">
              <option value="">全部状态</option>
              <option value="active">上架</option>
              <option value="inactive">下架</option>
            </select>
            <button class="btn btn-outline btn-sm" @click="handleSearch">🔍 搜索</button>
          </div>
          <button class="btn btn-outline btn-sm">📥 导出</button>
          <button class="btn btn-outline btn-sm" @click="handleBatchDelete" v-if="selectedIds.length > 0">
            🗑️ 批量删除 ({{ selectedIds.length }})
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="handleSelectAll" /></th>
            <th>商品</th>
            <th>分类</th>
            <th>价格</th>
            <th>库存</th>
            <th>销量</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <input
                type="checkbox"
                :value="product.id"
                v-model="selectedIds"
              />
            </td>
            <td>
              <div class="product-info">
                <div class="product-thumb">{{ product.icon || '📦' }}</div>
                <div>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-id">ID: {{ product.id }}</div>
                </div>
              </div>
            </td>
            <td>{{ product.category }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td>-</td>
            <td>-</td>
            <td>
              <StatusBadge :status="product.isActive ? 'active' : 'inactive'" />
            </td>
            <td>
              <div class="action-btns">
                <a
                  class="view"
                  :href="`/product/${product.id}`"
                  target="_blank"
                  title="查看"
                >👁️</a>
                <router-link
                  :to="`/products/edit/${product.id}`"
                  class="edit"
                  title="编辑"
                >✏️</router-link>
                <button
                  class="delete"
                  title="删除"
                  @click="handleDelete(product.id)"
                >🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <span class="info">共 {{ total }} 条商品</span>
        <Pagination
          :current="page"
          :total="total"
          :page-size="pageSize"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useList, useDelete, useUpdateStatus } from '@/composables/useApi'
import { api } from '@/utils/request'
import { formatPrice } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'

const {
  loading,
  data: products,
  total,
  page,
  pageSize,
  keyword,
  filters,
  fetchList,
  handleSearch,
  handlePageChange
} = useList<any>('/products')

const { handleDelete } = useDelete('/products')
const { updateStatus } = useUpdateStatus('/products')

const selectedIds = ref<number[]>([])
const DEFAULT_CATEGORIES = ['套装', '礼盒', '单品', '限量版']
const categories = ref<string[]>([...DEFAULT_CATEGORIES])

const selectAll = computed({
  get: () => products.value.length > 0 && selectedIds.value.length === products.value.length,
  set: (value: boolean) => {
    if (value) {
      selectedIds.value = products.value.map(p => p.id)
    } else {
      selectedIds.value = []
    }
  }
})

const handleSelectAll = () => {
  // selectAll computed 会自动处理
}

const normalizeCategories = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return []

  return Array.from(
    new Set(
      raw
        .map(item => String(item ?? '').trim())
        .filter(Boolean)
    )
  )
}

const fetchCategories = async () => {
  try {
    const response = await api.get<any>('/products/categories')
    const remoteCategories = normalizeCategories(response?.data ?? response)
    categories.value = remoteCategories.length > 0 ? remoteCategories : [...DEFAULT_CATEGORIES]
  } catch (error) {
    console.warn('获取分类失败，使用默认分类:', error)
    categories.value = [...DEFAULT_CATEGORIES]
  }
}

const handleBatchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 个商品吗？`)) return
  
  for (const id of selectedIds.value) {
    await handleDelete(id)
  }
  
  selectedIds.value = []
  fetchList()
}

const handleStatusChange = async (id: number, status: string) => {
  await updateStatus(id, status, '状态更新成功！')
  fetchList()
}

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>

<style scoped>
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-thumb {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.product-name {
  font-weight: 500;
  color: var(--text-primary);
}

.product-id {
  font-size: 12px;
  color: var(--text-secondary);
}

.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

@media (max-width: 768px) {
  .table-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    flex-wrap: wrap;
  }
}
</style>
