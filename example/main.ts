import Vue from 'vue'
import App from './App.vue'
import VDepthChart from '../package/index'

Vue.config.productionTip = false

Vue.use(VDepthChart)

new Vue({
  render: h => h(App)
}).$mount('#app')
