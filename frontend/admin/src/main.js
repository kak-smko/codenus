import { createApp } from 'vue'
import App from './App.vue'
import Axios from './plugins/axios'
import router from './router/index.js'
import renusify from 'renusify'


const app = createApp(App)
  .use(router)
  .use(Axios)
  .use(renusify, {
    rtl: false,
    lang: 'en',
    package: 'admin'
  })

window.app = app.mount('#app')

