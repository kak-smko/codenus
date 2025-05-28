import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.baseURL = `${import.meta.env.VITE_APP_API_URL}/api`;
axios.defaults.headers["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.post["Content-Type"] = "application/json";

// Variable to track if a token refresh is in progress
let isRefreshing = false;
// Array to hold pending requests while token is being refreshed
let failedQueue = [];

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
        window.app.$r.store.user = { login: false, info: {} };
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
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = token;
            return axios(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;


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

          // Retry the original request
          return axios(originalRequest);
        } catch (err) {
          processQueue(err, null);
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
