
// import { defaultOptions } from './deepth-chart/config'
import vDeepthChart from './depth-chart/v-depth-chart'

export function install (Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  // const finalOptions = Object.assign(defaultOptions, options)

  // plugin.options = finalOptions

  Vue.component('v-depth-chart', vDeepthChart)
}

const plugin = {
  install,
  vDeepthChart
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}

if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default plugin
