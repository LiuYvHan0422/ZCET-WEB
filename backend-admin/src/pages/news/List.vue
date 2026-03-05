<template>
  <div class="news-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">新闻动态</h1>
        <p class="page-subtitle">管理新闻内容，支持搜索、筛选和删除。</p>
      </div>
      <router-link to="/news/add" class="btn btn-primary">+ 发布新闻</router-link>
    </div>

    <div class="data-table-container">
      <div class="table-header">
        <div class="table-title">文章列表</div>
        <div class="table-actions">
          <div class="search-box">
            <input
              v-model="keyword"
              type="text"
              class="search-input"
              placeholder="搜索文章标题..."
              @keyup.enter="handleSearch"
            />
            <select v-model="filters.category" class="filter-select" @change="handleSearch">
              <option value="">全部分类</option>
              <option value="公司新闻">公司新闻</option>
              <option value="行业动态">行业动态</option>
              <option value="产品更新">产品更新</option>
            </select>
            <select v-model="filters.status" class="filter-select" @change="handleSearch">
              <option value="">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
            <button class="btn btn-outline btn-sm" @click="handleSearch">搜索</button>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th><input v-model="selectAll" type="checkbox" /></th>
            <th>文章</th>
            <th>分类</th>
            <th>作者</th>
            <th>浏览量</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="news in newsList" :key="news.id">
            <td><input v-model="selectedIds" type="checkbox" :value="news.id" /></td>
            <td>
              <div class="news-item">
                <div class="news-thumb">
                  <img
                    v-if="getNewsImage(news)"
                    :src="getNewsImage(news)"
                    :alt="news.title || '新闻封面'"
                    loading="lazy"
                  />
                  <span v-else>📰</span>
                </div>
                <div class="news-info">
                  <h4>{{ news.title }}</h4>
                  <div class="news-meta">ID: {{ news.id }}</div>
                </div>
              </div>
            </td>
            <td><span class="category-tag">{{ news.category || '-' }}</span></td>
            <td>{{ news.author || '-' }}</td>
            <td>{{ news.views || 0 }}</td>
            <td>
              <StatusBadge :status="news.status || (news.isPublished ? 'published' : 'draft')" />
            </td>
            <td>{{ formatDate(news.createdAt) }}</td>
            <td>
              <div class="action-btns">
                <a :href="`/news/${news.id}`" target="_blank" class="view" title="查看">👁️</a>
                <router-link :to="`/news/edit/${news.id}`" class="edit" title="编辑">✏️</router-link>
                <button class="delete" title="删除" @click="handleDelete(news.id)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <span class="info">共 {{ total }} 篇文章</span>
        <Pagination :current="page" :total="total" :page-size="pageSize" @change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useList, useDelete } from '@/composables/useApi';
import { formatDate } from '@/utils/helpers';
import StatusBadge from '@/components/StatusBadge.vue';
import Pagination from '@/components/Pagination.vue';

const {
  data: newsList,
  total,
  page,
  pageSize,
  keyword,
  filters,
  fetchList,
  handleSearch,
  handlePageChange,
} = useList<any>('/news');

const { handleDelete } = useDelete('/news');
const selectedIds = ref<number[]>([]);
const getNewsImage = (news: any): string => (news?.coverImage || news?.image || '').trim();

const selectAll = computed({
  get: () => newsList.value.length > 0 && selectedIds.value.length === newsList.value.length,
  set: (val) => {
    selectedIds.value = val ? newsList.value.map((n: any) => n.id) : [];
  },
});

onMounted(fetchList);
</script>

<style scoped>
.news-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.news-thumb {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-md);
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  overflow: hidden;
}

.news-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-info h4 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.news-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(64, 158, 255, 0.1);
  color: var(--primary);
}

.table-actions {
  display: flex;
  gap: 10px;
}
</style>
