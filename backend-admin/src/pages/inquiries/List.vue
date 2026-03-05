<template>
  <div class="inquiries-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">询盘管理</h1>
        <p class="page-subtitle">管理客户询盘，支持查看、筛选与关闭询盘。</p>
      </div>
    </div>

    <div class="data-table-container">
      <div class="table-header">
        <div class="table-title">📬 询盘列表</div>
        <div class="table-actions">
          <div class="search-box">
            <input
              v-model="keyword"
              type="text"
              class="search-input"
              placeholder="搜索客户姓名或电话..."
              @keyup.enter="handleSearch"
            />
            <select v-model="filters.status" class="filter-select" @change="handleSearch">
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="replied">已回复</option>
              <option value="closed">已关闭</option>
            </select>
            <button class="btn btn-outline btn-sm" @click="handleSearch">搜索</button>
          </div>
          <button class="btn btn-outline btn-sm">导出</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th><input v-model="selectAll" type="checkbox" /></th>
            <th>询盘ID</th>
            <th>客户姓名</th>
            <th>联系电话</th>
            <th>意向产品</th>
            <th>留言摘要</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inquiry in inquiries" :key="inquiry.id">
            <td><input v-model="selectedIds" type="checkbox" :value="inquiry.id" /></td>
            <td>#INQ{{ String(inquiry.id).padStart(3, '0') }}</td>
            <td><strong>{{ inquiry.customerName }}</strong></td>
            <td>{{ inquiry.customerPhone }}</td>
            <td>{{ inquiry.productName || '-' }}</td>
            <td class="message-cell">{{ truncate(inquiry.message, 30) || '-' }}</td>
            <td><StatusBadge :status="inquiry.status" /></td>
            <td>{{ formatDate(inquiry.createdAt) }}</td>
            <td>
              <div class="action-btns">
                <router-link :to="`/inquiries/${inquiry.id}`" class="view" title="查看详情">👁️</router-link>
                <button
                  v-if="inquiry.status !== 'closed'"
                  class="delete"
                  title="关闭询盘"
                  @click="closeInquiry(inquiry.id)"
                >
                  ❌
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && inquiries.length === 0">
            <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 24px 0;">
              暂无询盘数据
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <span class="info">共 {{ total }} 条询盘</span>
        <Pagination :current="page" :total="total" :page-size="pageSize" @change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Pagination from '@/components/Pagination.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useList, useUpdateStatus } from '@/composables/useApi'
import { formatDate, truncate } from '@/utils/helpers'

const {
  loading,
  data: inquiries,
  total,
  page,
  pageSize,
  keyword,
  filters,
  fetchList,
  handleSearch,
  handlePageChange,
} = useList<any>('/inquiries')

const { updateStatus } = useUpdateStatus('/inquiries')

const selectedIds = ref<number[]>([])

const selectAll = computed({
  get: () => inquiries.value.length > 0 && selectedIds.value.length === inquiries.value.length,
  set: (val) => {
    selectedIds.value = val ? inquiries.value.map((item: any) => item.id) : []
  },
})

const closeInquiry = async (id: number) => {
  if (!confirm('确定要关闭此询盘吗？')) return

  const ok = await updateStatus(id, 'closed', '询盘已关闭')
  if (!ok) return

  const row = inquiries.value.find((item: any) => item.id === id)
  if (row) {
    row.status = 'closed'
  }

  await fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.message-cell {
  max-width: 200px;
  color: var(--text-secondary);
  font-size: 13px;
}

.table-actions {
  display: flex;
  gap: 10px;
}
</style>
