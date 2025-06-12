import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createAxiosWithFakeLatency(ms: number, baseConfig?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create(baseConfig)

  instance.interceptors.response.use(
    async (response: AxiosResponse) => {
      await delay(ms)
      return response
    },
    async (error) => {
      await delay(ms)
      return Promise.reject(error)
    },
  )

  return instance
}

export const api = createAxiosWithFakeLatency(500, { baseURL: 'http://localhost:3333' })
