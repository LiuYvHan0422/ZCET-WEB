import { ref } from 'vue';
import { api } from '@/utils/request';
import { getStatusText, getStatusType } from '@/utils/helpers';

export function useList<T>(endpoint: string) {
  const loading = ref(false);
  const data = ref<T[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const keyword = ref('');
  const filters = ref<Record<string, any>>({});

  const fetchList = async () => {
    loading.value = true;
    try {
      const params: Record<string, any> = {
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value,
        ...filters.value,
      };

      const response = await api.get<any>(endpoint, params);

      if (response && (response.code === 0 || response.code === 200)) {
        const responseData = response.data;
        const pagination = response.pagination || responseData?.pagination;

        if (Array.isArray(responseData)) {
          data.value = responseData;
          total.value = pagination?.total || responseData.length || 0;
        } else if (Array.isArray(responseData?.list)) {
          data.value = responseData.list;
          total.value =
            responseData.total || responseData.pagination?.total || pagination?.total || 0;
        } else {
          data.value = [];
          total.value = 0;
        }

        if (pagination) {
          page.value = pagination.page || page.value;
          pageSize.value = pagination.limit || pagination.pageSize || pageSize.value;
        }
      } else if (Array.isArray(response)) {
        data.value = response;
        total.value = response.length;
      } else if (Array.isArray(response?.list)) {
        data.value = response.list;
        total.value = response.total || 0;
      } else {
        data.value = [];
        total.value = 0;
      }
    } catch (error) {
      console.error('获取列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    page.value = 1;
    fetchList();
  };

  const handleReset = () => {
    keyword.value = '';
    filters.value = {};
    page.value = 1;
    fetchList();
  };

  const handlePageChange = (newPage: number) => {
    page.value = newPage;
    fetchList();
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    filters.value = newFilters;
    page.value = 1;
    fetchList();
  };

  return {
    loading,
    data,
    total,
    page,
    pageSize,
    keyword,
    filters,
    fetchList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleFilterChange,
  };
}

export function useDetail<T>(endpoint: string) {
  const loading = ref(false);
  const item = ref<T | null>(null);

  const fetchDetail = async (id: number | string) => {
    loading.value = true;
    try {
      const response = await api.get<{ code: number; data: T }>(`${endpoint}/${id}`);
      if (response.code === 0 || response.code === 200) {
        item.value = response.data || null;
      }
    } catch (error) {
      console.error('获取详情失败:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    item,
    fetchDetail,
  };
}

export function useDelete(endpoint: string) {
  const deleting = ref(false);

  const handleDelete = async (
    id: number | string,
    message: string = '确定要删除这项吗？',
  ) => {
    if (!confirm(message)) return false;

    deleting.value = true;
    try {
      const response = await api.delete<{ code: number; message: string }>(`${endpoint}/${id}`);

      if (response.code === 0 || response.code === 200) {
        alert('删除成功！');
        return true;
      }

      alert(response.message || '删除失败');
      return false;
    } catch {
      alert('删除失败，请稍后重试');
      return false;
    } finally {
      deleting.value = false;
    }
  };

  return {
    deleting,
    handleDelete,
  };
}

export function useUpdateStatus(endpoint: string) {
  const updating = ref(false);

  const updateStatus = async (
    id: number | string,
    status: string,
    successMessage: string = '状态更新成功！',
  ) => {
    updating.value = true;
    try {
      const response = await api.put<{ code: number; message: string }>(
        `${endpoint}/${id}/status`,
        { status },
      );

      if (response.code === 0 || response.code === 200) {
        alert(successMessage);
        return true;
      }

      alert(response.message || '更新失败');
      return false;
    } catch {
      alert('更新失败，请稍后重试');
      return false;
    } finally {
      updating.value = false;
    }
  };

  return {
    updating,
    updateStatus,
  };
}

export { api, getStatusText, getStatusType };
