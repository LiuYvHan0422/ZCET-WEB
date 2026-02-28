<template>
  <div class="certificates-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">荣誉资质</h1>
        <p class="page-subtitle">管理公司荣誉资质、专利证书等内容。</p>
      </div>
      <router-link to="/certificates/add" class="btn btn-primary">➕ 添加资质</router-link>
    </div>
    <div class="filter-tabs">
      <span class="filter-tab" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">全部 ({{ total }})</span>
      <span class="filter-tab" :class="{ active: activeFilter === 'patent' }" @click="setFilter('patent')">专利证书</span>
      <span class="filter-tab" :class="{ active: activeFilter === 'iso' }" @click="setFilter('iso')">体系认证</span>
      <span class="filter-tab" :class="{ active: activeFilter === 'award' }" @click="setFilter('award')">获奖荣誉</span>
    </div>
    <div class="certificates-grid">
      <div class="certificate-card" v-for="cert in certificates" :key="cert.id">
        <div class="certificate-img" :style="{ background: cert.bgColor }">
          {{ cert.icon }}
          <span class="certificate-type">{{ cert.type }}</span>
        </div>
        <div class="certificate-info">
          <div class="certificate-name">{{ cert.name }}</div>
          <div class="certificate-meta">{{ cert.date }}</div>
          <StatusBadge :status="cert.status" />
          <div class="certificate-actions">
            <router-link :to="`/certificates/edit/${cert.id}`" class="edit">✏️ 编辑</router-link>
            <button class="delete" @click="handleDelete(cert.id)">🗑️ 删除</button>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination">
      <Pagination :current="page" :total="total" :page-size="pageSize" @change="handlePageChange" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useList, useDelete } from '@/composables/useApi'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
const { loading, data: certificates, total, page, pageSize, fetchList, handlePageChange } = useList<any>('/certificates')
const { handleDelete } = useDelete('/certificates')
const activeFilter = ref('all')
const setFilter = (filter: string) => { activeFilter.value = filter; fetchList() }
onMounted(fetchList)
</script>
<style scoped>
.filter-tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-tab { padding: 8px 16px; border-radius: 20px; background: var(--white); border: 1px solid var(--border-color); cursor: pointer; font-size: 14px; transition: all 0.3s; }
.filter-tab:hover, .filter-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
.certificates-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.certificate-card { background: var(--white); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transition: all 0.3s; }
.certificate-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-hover); }
.certificate-img { height: 180px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white; position: relative; }
.certificate-type { position: absolute; top: 10px; left: 10px; padding: 4px 10px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px; }
.certificate-info { padding: 16px; }
.certificate-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.certificate-meta { font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; }
.certificate-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); }
.certificate-actions a { flex: 1; text-align: center; padding: 8px; border-radius: 6px; font-size: 12px; text-decoration: none; transition: all 0.3s; }
.certificate-actions a.edit { background: rgba(64, 158, 255, 0.1); color: var(--primary); }
.certificate-actions a.edit:hover { background: var(--primary); color: white; }
.certificate-actions button.delete { flex: 1; background: rgba(245, 108, 108, 0.1); color: var(--danger); border: none; cursor: pointer; border-radius: 6px; font-size: 12px; }
.certificate-actions button.delete:hover { background: var(--danger); color: white; }
.pagination { display: flex; justify-content: center; padding: 30px; gap: 8px; }
@media (max-width: 1200px) { .certificates-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .certificates-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
