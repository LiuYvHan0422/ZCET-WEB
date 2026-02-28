<template>
  <div class="inquiries-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">询盘管理</h1>
        <p class="page-subtitle">管理客户询盘，包括查看、回复、跟踪询盘状态。</p>
      </div>
    </div>
    <div class="data-table-container">
      <div class="table-header">
        <div class="table-title">📬 询盘列表</div>
        <div class="table-actions">
          <div class="search-box">
            <input type="text" class="search-input" placeholder="搜索客户姓名或电话..." v-model="keyword" @keyup.enter="handleSearch" />
            <select class="filter-select" v-model="filters.status" @change="handleSearch">
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="replied">已回复</option>
              <option value="closed">已关闭</option>
            </select>
            <button class="btn btn-outline btn-sm" @click="handleSearch">🔍 搜索</button>
          </div>
          <button class="btn btn-outline btn-sm">📥 导出</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" /></th>
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
            <td><input type="checkbox" :value="inquiry.id" v-model="selectedIds" /></td>
            <td>#INQ{{ String(inquiry.id).padStart(3, '0') }}</td>
            <td><strong>{{ inquiry.customerName }}</strong></td>
            <td>{{ inquiry.customerPhone }}</td>
            <td>{{ inquiry.productName }}</td>
            <td class="message-cell">{{ truncate(inquiry.message, 30) }}</td>
            <td><StatusBadge :status="inquiry.status" /></td>
            <td>{{ formatDate(inquiry.createdAt) }}</td>
            <td>
              <div class="action-btns">
                <router-link :to="`/inquiries/${inquiry.id}`" class="view" title="查看详情">👁️</router-link>
                <button class="reply" title="快速回复" @click="quickReply(inquiry)" v-if="inquiry.status === 'pending'">📧</button>
                <button class="delete" title="关闭" @click="closeInquiry(inquiry.id)" v-if="inquiry.status !== 'closed'">❌</button>
              </div>
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
import { ref, computed, onMounted } from 'vue'
import { useList, useUpdateStatus } from '@/composables/useApi'
import { formatDate, truncate } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
const { loading, data: inquiries, total, page, pageSize, keyword, filters, fetchList, handleSearch, handlePageChange } = useList<any>('/inquiries')
const { updateStatus } = useUpdateStatus('/inquiries')
const selectedIds = ref<number[]>([])
const selectAll = computed({ get: () => inquiries.value.length > 0 && selectedIds.value.length === inquiries.value.length, set: (val) => { selectedIds.value = val ? inquiries.value.map((i: any) => i.id) : [] } })
const quickReply = (inquiry: any) => { alert(`快捷回复：${inquiry.customerName}`) }
const closeInquiry = async (id: number) => { if (confirm('确定要关闭此询盘吗？')) await updateStatus(id, 'closed', '询盘已关闭') }
onMounted(fetchList)
</script>
<style scoped>
.message-cell { max-width: 200px; color: var(--text-secondary); font-size: 13px; }
.table-actions { display: flex; gap: 10px; }
</style>
