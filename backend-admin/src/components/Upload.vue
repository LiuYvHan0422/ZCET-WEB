<template>
  <div class="upload-component">
    <div
      class="upload-area"
      :class="{ dragover: isDragover }"
      @click="triggerSelect"
      @dragover.prevent="isDragover = true"
      @dragleave.prevent="isDragover = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        style="display: none"
      />
      <div class="upload-placeholder" v-if="!imageUrl">
        <div class="icon">📁</div>
        <p>点击或拖拽图片到此处上传</p>
        <p class="hint">{{ acceptText }}</p>
      </div>
      <div class="image-preview" v-else>
        <img :src="imageUrl" alt="预览图" />
        <button class="remove-btn" @click.stop="removeImage">×</button>
      </div>
    </div>
    <p class="upload-hint" v-if="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '@/utils/request'

const props = withDefaults(defineProps<{
  modelValue: string
  type?: string
  accept?: string
  multiple?: boolean
  maxSize?: number
  hint?: string
}>(), {
  accept: 'image/*',
  multiple: false,
  maxSize: 5 * 1024 * 1024, // 5MB
  type: 'common'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'success', url: string): void
  (e: 'error', error: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const uploading = ref(false)

const imageUrl = computed(() => props.modelValue)
const acceptText = computed(() => {
  const types = props.accept.split(',').map(t => t.trim().replace('image/', '').toUpperCase())
  return `支持 ${types.join('、')} 格式，文件大小不超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`
})

const triggerSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    uploadFile(files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    uploadFile(files[0])
  }
}

const uploadFile = async (file: File) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('只能上传图片文件')
    return
  }
  
  // 验证文件大小
  if (file.size > props.maxSize) {
    alert(`文件大小不能超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`)
    return
  }
  
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', props.type)
    
    const response = await api.upload<{
      code: number
      data: { url: string }
      message: string
    }>('/upload', formData)
    
    if (response.code === 0 && response.data?.url) {
      emit('update:modelValue', response.data.url)
      emit('success', response.data.url)
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error: any) {
    emit('error', error.message || '上传失败')
    alert(error.message || '上传失败')
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeImage = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.upload-component {
  width: 100%;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--white);
}

.upload-area:hover,
.upload-area.dragover {
  border-color: var(--primary);
  background: rgba(64, 158, 255, 0.02);
}

.upload-placeholder .icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.upload-placeholder p {
  color: var(--text-secondary);
  font-size: 14px;
}

.upload-placeholder .hint {
  margin-top: 10px;
  font-size: 12px;
}

.upload-placeholder .hint strong {
  color: var(--primary);
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: var(--danger);
}

.upload-hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
