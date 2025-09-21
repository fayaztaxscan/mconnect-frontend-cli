import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'        // uses the router instance exported below
import './assets/index.css'

const app = createApp(App)

// Install Pinia before mounting (fixes getActivePinia error)
const pinia = createPinia()
app.use(pinia)

app.use(router)
app.mount('#app')
