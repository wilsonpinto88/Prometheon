import axios from 'axios'

const client = axios.create({ baseURL: '/' })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const api = {
  async fetchTexts() {
    const { data } = await client.get('/api/texts')
    return data
  },

  async fetchTextById(id: string) {
    const { data } = await client.get(`/api/texts/${id}`)
    return data
  },

  async fetchTasks() {
    const { data } = await client.get('/api/tasks')
    return data
  },

  async fetchTaskById(id: string) {
    const { data } = await client.get(`/api/tasks/${id}`)
    return data
  },

  // Backend endpoint is a toggle; second arg kept for caller compatibility
  async updateTaskComplete(taskId: string, _completed?: boolean) {
    const { data } = await client.patch(`/api/progress/tasks/${taskId}/complete`)
    return data
  },

  async fetchProgress() {
    const { data } = await client.get('/api/progress')
    return data
  },
}
