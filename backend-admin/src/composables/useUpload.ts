import { ref } from 'vue'
import { api } from '@/utils/request'

export function useUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)

  const uploadImage = async (
    file: File,
    type: string = 'common'
  ): Promise<string | null> => {
    uploading.value = true
    uploadProgress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await api.upload<{
        code: number
        data: { url: string }
        message: string
      }>('/upload', formData)

      if (response.code === 0 && response.data?.url) {
        return response.data.url
      } else {
        alert(response.message || '上传失败')
        return null
      }
    } catch (error) {
      alert('上传失败，请稍后重试')
      return null
    } finally {
      uploading.value = false
      uploadProgress.value = 100
    }
  }

  const uploadMultiple = async (
    files: FileList,
    type: string = 'common'
  ): Promise<string[]> => {
    const urls: string[] = []
    
    for (const file of Array.from(files)) {
      const url = await uploadImage(file, type)
      if (url) {
        urls.push(url)
      }
    }
    
    return urls
  }

  return {
    uploading,
    uploadProgress,
    uploadImage,
    uploadMultiple
  }
}
