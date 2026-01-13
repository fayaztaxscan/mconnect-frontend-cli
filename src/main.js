// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './assets/index.css'

const app = createApp(App)

// Pinia first
const pinia = createPinia()
app.use(pinia)

// Router
app.use(router)

// ✅ Element Plus (THIS WAS MISSING)
app.use(ElementPlus)

app.mount('#app')
