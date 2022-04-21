import axios, { AxiosInstance, HeadersDefaults } from "axios"
import { Cookies } from "quasar"

const createAPI = (baseURL?: string, appID?: string, simple?: boolean): AxiosInstance | undefined => {
  if (baseURL) {
    Cookies.set('X-Base-URL', baseURL)
  }
  if (appID) {
    Cookies.set('X-App-ID', appID)
  }

  if (!Cookies.get('X-Base-URL') || Cookies.get('X-Base-URL')?.length === 0 ||
      !Cookies.get('X-App-ID') || Cookies.get('X-App-ID')?.length === 0) {
    return undefined
  }

  const api = axios.create({
    method: 'POST',
    baseURL: process.env.DEV ? '/api' : Cookies.get('X-Base-URL'),
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': Cookies.get('X-App-ID'),
      'X-User-ID': Cookies.get('X-User-ID'),
      'X-Lang-ID': Cookies.get('X-Lang-ID'),
      'X-App-Login-Token': Cookies.get('X-App-Login-Token')
    },
    withCredentials: false,
    responseType: 'json',
    timeout: 60000
  })

  if (simple) {
    api.defaults.headers = {} as unknown as HeadersDefaults
  }

  return api
}

export {
  createAPI
}
