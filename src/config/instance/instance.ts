import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import Cookies from 'js-cookie'
import { StorageEnum } from '@/types'
import { useAuthStore } from '@/stores/use-auth-store'
import { setItem } from '@/utils/storage'

// const token = Cookies.get('token') || '';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

// Define a general API response structure
interface ApiResponse<T> {
  statusCode: number
  error: boolean
  message?: string
  data: T
  success?: boolean
  status:number
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().user?.token ?? useAuthStore.getState().token
    config.headers.Authorization = `Bearer ${token}`
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    } else if (config.data) {
      config.headers['Content-Type'] = 'application/json;charset=utf-8'
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  <T>(res: AxiosResponse<ApiResponse<T>>) => {
    if (!res.data) throw new Error('Error in response')
    const { statusCode, success } = res.data

    const hasSuccess =
      (statusCode === 200 || statusCode === 201 || statusCode === 202) && success === true

    if (hasSuccess) {
      // The data is already intact, no need to reassign
      return res
    }
    throw new Error(res.data.message || 'Unknown API error')
  },
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      setItem(StorageEnum.TOKEN, null)
      window.localStorage.clear()
      Cookies.remove('token')
    }
    return Promise.reject(error)
  }
)

class Instance {
  get<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: 'GET' })
  }

  post<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: 'POST' })
  }

  put<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: 'PUT' })
  }

  patch<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: 'PATCH' })
  }

  delete<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: 'DELETE' })
  }

  request<T>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<T>(config).then((res) => res.data)
  }
}

export default new Instance()
