# vue深度图组件
常用于股市、虚拟货币等交易所使用

# 示意图
![image](public/depth.png)
# 使用方式
## 1. 安装
` npm i v-deepth-chart `
## 2. 引用
``` javascript
import VDeepthChart from 'v-deepth-chart'
// 全局引用
Vue.use(VDeepthChart)
```
## 3.调用

```html
<v-deepth-chart :data="data"></v-deepth-chart>
```

