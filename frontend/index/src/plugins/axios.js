import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.baseURL = `${import.meta.env.VITE_APP_API_URL}/api`;
axios.defaults.headers["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.post["Content-Type"] = "application/json";

// Variables to track token refresh state
let isRefreshing = false;
let failedQueue = [];

// Use BroadcastChannel for cross-tab communication (modern browsers)
let refreshChannel;
try {
  refreshChannel = new BroadcastChannel('token-refresh');
} catch (e) {
  console.warn('BroadcastChannel not supported, falling back to localStorage');
}

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Listen for refresh events from other tabs
if (refreshChannel) {
  refreshChannel.onmessage = (event) => {
    const {type, token} = event.data;

    if (type === 'refresh_started') {
      isRefreshing = true;
    } else if (type === 'refresh_completed') {
      isRefreshing = false;
      if (token) {
        window.app.$storage.set("auth.token", token);
        axios.defaults.headers.common.Authorization = token;
        processQueue(null, token);
      }
    } else if (type === 'refresh_failed') {
      isRefreshing = false;
      processQueue(new Error('Token refresh failed in another tab'));
    }
  };
} else {
  // Fallback to localStorage if BroadcastChannel is not available
  // Listen for storage events (cross-tab communication)
  window.addEventListener('storage', (event) => {
    if (event.key === 'token_refresh_status') {
      const status = event.newValue;
      if (status === 'completed') {
        const newToken = window.app.$storage.get("auth.token");
        axios.defaults.headers.common.Authorization = newToken;
        processQueue(null, newToken);
        isRefreshing = false;
      } else if (status === 'failed') {
        processQueue(new Error('Token refresh failed'));
        isRefreshing = false;
      } else if (status === 'started') {
        isRefreshing = true;
      }
    }
  });
}
axios.interceptors.request.use(
  (config) => {
    if (window.app.$storage.has("auth.token")) {
      config.headers.Authorization =
        window.app.$storage.get("auth.token");
    }
    config.headers.lang = window.app.$r.lang;

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = window.app.$helper.htmlDecode(response.data);
      if (response.data.msg) {
        window.app.$toast(window.app.$t(response.data.msg));
      }
    }
    return response;
  },
  async (error) => {
    const res = error.response;
    const originalRequest = error.config;

    if (res && res.status === 307 && res.data.location) {
      console.log("redirect to:" + res.data.location);
      window.location.replace(res.data.location);
      return Promise.reject(error);
    }

    if (res && res.data.msg === "auth.failed") {
      window.app.$toast(window.app.$t("auth.failed"), {
        type: "error",
      });
      window.app.$r.store.user = {login: false, info: {}};
      window.app.$storage.remove("auth.token");
      window.app.$storage.remove("user_login");
      return Promise.reject(error);
    } else if (res && res.data.msg) {
      window.app.$toast(window.app.$t(res.data.msg), {
        type: "error",
      });
      return Promise.reject(error);
    } else if (res && res.data.token === "renew") {
      // If this is already a retry request, reject to avoid infinite loop
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      // If we're already refreshing the token, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers.Authorization = token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Notify other tabs that refresh is starting
      if (refreshChannel) {
        refreshChannel.postMessage({type: 'refresh_started'});
      } else {
        localStorage.setItem('token_refresh_status', 'started');
      }

      try {
        // Call your token renewal endpoint
        const response = await axios.get('/user/renew-token');
        const newToken = response.data.token;

        // Store the new token
        window.app.$storage.set("auth.token", newToken);

        // Update the Authorization header
        axios.defaults.headers.common.Authorization = newToken;
        originalRequest.headers.Authorization = newToken;

        // Process the queue
        processQueue(null, newToken);

        // Notify other tabs that refresh completed successfully
        if (refreshChannel) {
          refreshChannel.postMessage({
            type: 'refresh_completed',
            token: newToken
          });
        } else {
          localStorage.setItem('token_refresh_status', 'completed');
          localStorage.setItem('auth_token', newToken);
        }

        // Retry the original request
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Notify other tabs that refresh failed
        if (refreshChannel) {
          refreshChannel.postMessage({type: 'refresh_failed'});
        } else {
          localStorage.setItem('token_refresh_status', 'failed');
        }

        window.app.$toast(window.app.$t("auth.token_renewal_failed"), {
          type: "error",
        });
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default {
  install: (app) => {
    app.config.globalProperties.$axios = axios;
    app.provide('axios', app.config.globalProperties.$axios);
  },
};
