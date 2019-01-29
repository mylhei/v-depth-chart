import Vue from 'vue'
import App from './App.vue'
import VDeepthChart from '../package/index'

Vue.config.productionTip = false

Vue.use(VDeepthChart)

new Vue({
  render: h => h(App)
}).$mount('#app')
