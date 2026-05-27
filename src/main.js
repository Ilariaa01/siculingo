import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import './style.css'
import App from './App.vue'
import router from './router/routing.js'

createApp(App)
  .use(router)
  .mount('#app')