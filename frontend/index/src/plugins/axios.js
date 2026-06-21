import axios from 'axios'
import { Crypto } from '@/plugins/ecc.js'

const serverPublicKey = import.meta.env.VITE_APP_SERVER_PUBKEY

const cryptor = new Crypto()

// Full config
axios.defaults.baseURL = `${import.meta.env.VITE_APP_API_URL}/api`
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.post['Content-Type'] = 'application/json'
// add encryption to all requests
axios.defaults.encrypt = import.meta.env.VITE_APP_ENCRYPT

// Variables to track token refresh state
let isRefreshing = false
let failedQueue = []

// Use BroadcastChannel for cross-tab communication
let refreshChannel
try {
  refreshChannel = new BroadcastChannel('token-refresh')
} catch (e) {
  console.warn('BroadcastChannel not supported', e)
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Listen for refresh events from other tabs
if (refreshChannel) {
  refreshChannel.onmessage = async (event) => {
    const { type, token, sharedKey } = event.data
    if (type === 'refresh_started') {
      isRefreshing = true
    } else if (type === 'refresh_completed') {
      isRefreshing = false
      if (token) {
        await window.app.$storage.setSafe('auth.token', token)
        axios.defaults.headers.common.Authorization = token
        processQueue(null, token)
      }
    } else if (type === 'refresh_failed') {
      isRefreshing = false
      processQueue(new Error('Token refresh failed in another tab'))
    } else if (type === 'crypto_key') {
      cryptor.sharedKey = sharedKey
    }
  }
}

// 🔐 Helper: Encrypt request data
const encryptRequestData = (data, contentType) => {
  // If data is already a string or FormData/Blob, handle accordingly
  if (data instanceof FormData || data instanceof Blob || data instanceof URLSearchParams) {
    // For FormData/Blob, convert to JSON string first if possible
    if (data instanceof FormData) {
      const obj = {}
      data.forEach((value, key) => {
        obj[key] = value
      })
      data = obj
    } else if (data instanceof URLSearchParams) {
      data = Object.fromEntries(data.entries())
    }
  }

  // Convert data to string for encryption
  const dataString = typeof data === 'string' ? data : JSON.stringify(data)

  return cryptor.encrypt_text(dataString)
}

// 🔐 Request Interceptor: Auto-encrypt + handle response type
axios.interceptors.request.use(
  async (config) => {
    const methodsToEncrypt = ['post', 'put', 'patch', 'POST', 'PUT', 'PATCH']
    // Auth token
    if (window.app.$storage.has('auth.token')) {
      config.headers.Authorization = await window.app.$storage.getSafe('auth.token')
    }
    config.headers.lang = window.app.$r.lang
    // 🔐 Auto-encrypt request body if flag is set
    if (config.encrypt && methodsToEncrypt.includes(config.method) && config.data) {
      const originalContentType =
        config.headers['Content-Type'] || config.headers['content-type'] || 'application/json'

      // Encrypt the data
      return encryptRequestData(config.data, originalContentType).then((encryptedData) => {
        config.data = encryptedData

        // Set headers to inform server
        config.headers['encrypted'] = '1'
        config.headers['real-type'] = originalContentType
        config.headers['Content-Type'] = 'text/plain' // Encrypted data is base64 text

        // Also set responseType for encrypted responses
        config.responseType = 'arraybuffer'
        config.transformResponse = [(data) => data]

        return config
      })
    } else if (config.responseType === 'arraybuffer' || config.encrypt) {
      // 🔓 Handle non-encrypted but binary responses
      config.responseType = 'arraybuffer'
      config.transformResponse = [(data) => data]
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 🔓 Response Interceptor: Auto-decrypt if encrypted header present
axios.interceptors.response.use(
  async (response) => {
    const headers = response.headers
    let responseData = response.data

    // Helper: Parse decrypted text based on real-type header
    const parseDecrypted = (text, realType) => {
      if (!realType) return text
      if (realType.includes('application/json')) {
        try {
          return JSON.parse(text)
        } catch (e) {
          console.warn('Failed to parse decrypted JSON', e)
          return text
        }
      }
      if (realType.includes('text') || realType.includes('html')) {
        return text
      }
      return text
    }

    // 🔐 Check if response is encrypted
    const isEncrypted = headers.encrypted === '1'
    if (isEncrypted && responseData instanceof ArrayBuffer) {
      try {
        const encryptedBytes = new Uint8Array(responseData)
        const decryptedBytes = await cryptor.decrypt(encryptedBytes)
        const decryptedText = new TextDecoder('utf-8').decode(decryptedBytes)
        const realType = headers['real-type'] || headers['realType'] || 'application/json'
        responseData = parseDecrypted(decryptedText, realType)
      } catch (err) {
        console.error('Decryption failed:', err, response.request.responseURL)
        return Promise.reject(new Error('Failed to decrypt response'))
      }
    } else if (responseData instanceof ArrayBuffer) {
      // 🔓 Not encrypted: convert ArrayBuffer to appropriate format
      const contentType = headers['content-type'] || headers['Content-Type'] || ''
      if (contentType.includes('application/json')) {
        const text = new TextDecoder('utf-8').decode(new Uint8Array(responseData))
        try {
          responseData = JSON.parse(text)
        } catch (e) {
          console.warn('Failed to parse JSON response', e)
          responseData = text
        }
      } else if (contentType.includes('text') || contentType.includes('html')) {
        responseData = new TextDecoder('utf-8').decode(new Uint8Array(responseData))
      } else {
        responseData = new Uint8Array(responseData)
      }
    }

    // Apply existing htmlDecode logic
    if (responseData && typeof responseData === 'object' && responseData.msg) {
      responseData = window.app.$helper.htmlDecode(responseData)
      if (responseData.msg) {
        window.app.$toast(window.app.$t(responseData.msg))
      }
    }
    response.data = responseData
    return response
  },

  async (error) => {
    const res = error.response

    // 🔐 Try to decrypt error response if encrypted
    if (res?.headers && (res.headers.encrypted === '1' || res.headers['encrypted'] === '1')) {
      try {
        if (res.data instanceof ArrayBuffer) {
          const encryptedBytes = new Uint8Array(res.data)
          const decryptedBytes = await cryptor.decrypt(encryptedBytes)
          const decryptedText = new TextDecoder('utf-8').decode(decryptedBytes)
          const realType = res.headers['real-type'] || res.headers['realType'] || 'application/json'
          res.data = realType.includes('application/json')
            ? JSON.parse(decryptedText)
            : decryptedText
        }
      } catch (e) {
        console.warn('Failed to decrypt error response', e)
      }
    } else if (res?.data instanceof ArrayBuffer) {
      try {
        const contentType = res.headers['content-type'] || ''
        const text = new TextDecoder('utf-8').decode(new Uint8Array(res.data))
        res.data = contentType.includes('application/json') ? JSON.parse(text) : text
      } catch (e) {
        console.error(e)
      }
    }

    // Existing error handling
    if (res && res.status === 307 && res.data?.location) {
      console.log('redirect to:' + res.data.location)
      window.location.replace(res.data.location)
      return Promise.reject(error)
    }

    if (res && res.data?.msg === 'auth.failed') {
      window.app.$toast(window.app.$t('auth.failed'), { type: 'error' })
      window.app.$r.store.user = { login: false, info: {} }
      window.app.$storage.remove('auth.token')
      window.app.$storage.remove('user_login')
      return Promise.reject(error)
    } else if (res && res.data?.msg) {
      window.app.$toast(window.app.$t(res.data.msg), { type: 'error' })
      return Promise.reject(error)
    } else if (res && res.data?.token === 'renew') {
      if (error.config._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            error.config.headers.Authorization = token
            return axios(error.config)
          })
          .catch((err) => Promise.reject(err))
      }

      error.config._retry = true
      isRefreshing = true

      if (refreshChannel) {
        refreshChannel.postMessage({ type: 'refresh_started' })
      }

      try {
        const response = await axios.get('/user/renew-token')
        const newToken = response.data.token

        await window.app.$storage.setSafe('auth.token', newToken)
        axios.defaults.headers.common.Authorization = newToken
        error.config.headers.Authorization = newToken

        processQueue(null, newToken)

        if (refreshChannel) {
          refreshChannel.postMessage({ type: 'refresh_completed', token: newToken })
        }

        return axios(error.config)
      } catch (err) {
        processQueue(err, null)
        if (refreshChannel) {
          refreshChannel.postMessage({ type: 'refresh_failed' })
        }
        window.app.$toast(window.app.$t('auth.token_renewal_failed'), { type: 'error' })
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

axios.update_key = () => {
  isRefreshing = true
  if (refreshChannel) {
    refreshChannel.postMessage({ type: 'refresh_started' })
  }
  return cryptor
    .init(serverPublicKey)
    .then((clientPublicKey) => {
      return axios
        .post(
          '/user/renew-token',
          {
            pubKey: clientPublicKey,
          },
          { encrypt: false },
        )
        .then(
          async ({ data }) => {
            const newToken = data.token

            await window.app.$storage.setSafe('auth.token', newToken)
            axios.defaults.headers.common.Authorization = newToken

            if (refreshChannel) {
              refreshChannel.postMessage({ type: 'refresh_completed', token: newToken })
              refreshChannel.postMessage({ type: 'crypto_key', sharedKey: cryptor.sharedKey })
            }
            return Promise.resolve('ok')
          },
          (err) => {
            if (refreshChannel) {
              refreshChannel.postMessage({ type: 'refresh_failed' })
            }
            window.app.$toast(window.app.$t('auth.token_renewal_failed'), { type: 'error' })
            return Promise.reject(err)
          },
        )
    })
    .finally(() => {
      isRefreshing = false
    })
}
export default {
  install: (app) => {
    app.config.globalProperties.$axios = axios
    app.provide('axios', app.config.globalProperties.$axios)
  },
}
