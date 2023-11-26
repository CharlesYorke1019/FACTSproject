import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from 'vue-socket.io';

const app = createApp(App)

app.use(router)

app.mount('#app')
