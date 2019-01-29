<template>
  <div class="deepth-chart">
    <div class="deepth-chart-layout" :style="{height: (fHeight+24)+'px'}">
    <canvas class="chart" ref="chart" :width="fWidth" :height="fHeight" :style="{backgroundColor: bgColor}"></canvas>
    <canvas class="chart-mask" ref="chartMask" :width="fWidth" :height="fHeight"
      @mousemove="onMouseMove"
      @mouseout="onMouseOut"></canvas>
    <canvas class="chart-x" ref="chartX" :width="fWidth" :height="24" :style="{top: fHeight+'px', left: 0}"></canvas>
    <canvas class="chart-y" ref="chartY" :width="48" :height="fHeight" :style="{top: 0, left: fWidth+'px'}"></canvas>
    </div>
  </div>
</template>

<script>
import defaultOptions from './config'
import utils from '../utils'

export default {
  name: 'v-deepth-chart',
  data () {
    return {
      chart: null,
      context: null,
      maskChart: null,
      maskContext: null,
      xChart: null,
      xContext: null,
      yChart: null,
      yContext: null,
      finalOptions: Object.assign(defaultOptions, this.options),
      fWidth: parseFloat(this.width) - 48,
      fHeight: parseFloat(this.height) - 24,
      hasPaint: false,
      args: null,
      // 存储已全部点位对象
      valueMap: new Map()
    }
  },
  props: {
    data: {
      type: [Object, Array],
      default () {
        return {}
      }
    },
    options: {
      type: Object,
      default () {
        return null
      }
    },
    width: {
      type: String,
      default: '600px'
    },
    height: {
      type: String,
      default: '300px'
    },
    bgColor: {
      type: String,
      default: '#ffffff'
    },
    buyFillColor: {
      type: String,
      default: '#09C989'
    },
    sellFillColor: {
      type: String,
      default: '#F24E4D'
    },
    gap: {
      type: Number,
      default: 10
    },
    axisFontsize: {
      type: Number,
      default: 12
    }
  },
  watch: {
    'data': {
      handler (val) {
        this.valueMap = new Map()
        this.args = this._calcArgs(val, this.fWidth, this.fHeight)
        this._drawChart(val)
      },
      immediate: false
    }
  },
  computed: {
    isEmptyData () {
      return utils.isEmpty(this.data)
    }
  },
  methods: {
    _initChart () {
      this.chart = this.$refs['chart']
      this.context = utils.getContext2D(this.chart)
      this.maskChart = this.$refs['chartMask']
      this.maskContext = utils.getContext2D(this.maskChart)
      this.chartX = this.$refs['chartX']
      this.xContext = utils.getContext2D(this.chartX)
      this.chartY = this.$refs['chartY']
      this.yContext = utils.getContext2D(this.chartY)

      this._drawChart(this.data)
    },
    _resetChart () {
      this.chart = this.maskChart = this.chartX = this.chartY = null
    },
    _drawChart (data) {
      if (!this.args) {
        this.args = this._calcArgs(this.data, this.fWidth, this.fHeight)
      }
      if (!this.isEmptyData) {
        const context = this.context
        const width = parseFloat(this.fWidth)
        const height = parseFloat(this.fHeight)
        // const fWidth = width + 48
        // const fHeight = height + 24
        this._drawMainCanvas(context, data, width, height, this.args)
        this._drawXLine(data)
        this._drawYLine(data)
        this.hasPaint = true
      }
    },
    _drawXLine (data) {
      // X轴刻度
      const contextX = this.xContext
      const width = parseFloat(this.fWidth)
      if (this.hasPaint) {
        contextX.clearRect(0, 0, width, 24)
      }
      const { scaleW } = this.args
      contextX.fillStyle = '#ccc'
      let x = 0
      let y = 0
      contextX.textAlign = 'center'
      for (let i in data['buy']) {
        if (i % 3) continue
        x = width / 2 - i * scaleW - 30
        y = this.axisFontsize || 12
        contextX.fillText(data['buy'][i]['price'], x, y)
      }

      for (let i in data['sell']) {
        if (i % 3) continue
        x = width / 2 + i * scaleW + 15
        y = this.axisFontsize || 12
        let index = data['sell'].length - i - 1
        contextX.fillText(data['sell'][index]['price'], x, y)
      }
    },
    _drawYLine () {
      let x = 0
      let y = 0
      // y轴刻度
      const height = parseFloat(this.fHeight)
      const { maxAmount } = this.args
      const contextY = this.yContext
      if (this.hasPaint) {
        contextY.clearRect(0, 0, 48, height)
      }
      contextY.fillStyle = '#ccc'
      // Y轴5等份
      var seg = maxAmount / 5
      for (let i = 1; i < 6; i++) {
        x = this.axisFontsize || 12
        y = height - seg * i / maxAmount * height
        contextY.fillText(utils.toPretty(seg * i), x, y)
      }
    },
    _drawMainCanvas (context, data, width, height, args) {
      if (!args) {
        throw new Error('args not ok')
      }
      if (this.hasPaint) {
        context.clearRect(0, 0, width, height)
      }
      const { maxAmount, scaleW } = args
      let tempList = []
      const gap = this.gap
      context.beginPath()
      context.fillStyle = this.buyFillColor
      let x = 0
      let y = 0
      for (let i in data['buy']) {
        x = width / 2 - i * scaleW - gap
        y = height - data['buy'][i]['total'] / maxAmount * height
        tempList.push({
          x,
          y,
          value: data['buy'][i],
          side: 'buy'
        })
        context.lineTo(x, y)
      }
      context.lineTo(0, y) // 延伸到最左侧边缘
      context.lineTo(0, height)
      context.lineTo(width / 2 - gap, height)
      context.fill() // 形成一个封装区域 并按fillStyle指定的颜色填充
      context.closePath()

      // 画卖单
      context.beginPath()
      context.fillStyle = this.sellFillColor
      context.moveTo(width / 2 + gap, height)
      for (let i in data['sell']) {
        const index = data['sell'].length - i - 1
        x = width / 2 + i * scaleW + gap
        y = height - data['sell'][index]['total'] / maxAmount * height
        tempList.push({
          x,
          y,
          value: data['sell'][i],
          side: 'sell'
        })
        context.lineTo(x, y)
      }
      // 按照X升序排列
      tempList = tempList.sort((a, b) => {
        return a.x - b.x
      })
      //
      tempList.forEach(item => {
        this.valueMap.set([item.x, item.y, item.side], item.value)
      })
      context.lineTo(width + gap, y)
      context.lineTo(width + gap, height)
      context.lineTo(width / 2 + gap, height)
      context.fill()
      context.closePath()
    },
    _calcArgs (data, width, height) {
      if (!this.isEmptyData) {
        const maxAmount = Math.max(data['sell'][0]['total'], data['buy'][data['buy'].length - 1]['total'])
        const scaleH = maxAmount / height
        const scaleW = width / 2 / data['sell'].length

        return {
          maxAmount,
          scaleH,
          scaleW
        }
      }
      return null
    },
    onMouseMove ({ offsetX, offsetY }) {
      const valueMap = this.valueMap
      const maskContext = this.maskContext
      const buyFillColor = this.buyFillColor
      const sellFillColor = this.sellFillColor
      const width = this.fWidth
      const height = this.fHeight
      for (let key of valueMap.keys()) {
        const x = key[0]
        const y = key[1]
        const side = key[2]
        const obj = valueMap.get(key)

        if (offsetX < x) {
          // console.log(key, valueMap.get(key))
          maskContext.strokeStyle = 'rgba(200,200,200,0.5)'
          maskContext.lineWidth = 1
          maskContext.setLineDash([2])
          maskContext.clearRect(0, 0, width, height)
          maskContext.beginPath()
          maskContext.moveTo(0, y)
          maskContext.lineTo(width, y)
          maskContext.stroke()
          maskContext.closePath()

          maskContext.beginPath()
          maskContext.moveTo(x, 0)
          maskContext.lineTo(x, height)
          maskContext.stroke()
          maskContext.closePath()

          maskContext.beginPath()
          maskContext.shadowBlur = 20
          maskContext.shadowColor = 'rgba(0,0,0,0.8)'
          // 小圆点
          maskContext.fillStyle = 'rgba(255,255,255, 1)'
          maskContext.arc(x, y, 5, 0, 2 * Math.PI)
          maskContext.fill()
          maskContext.closePath()

          maskContext.beginPath()
          // tips框
          maskContext.fillStyle = 'rgba(255,255,255, 1)'
          let widthOffset = 120
          let heightOffset = 60
          let left = x - widthOffset / 2
          let top = y - heightOffset - 10
          if (side === 'sell') {
            // widthOffset = -widthOffset
            // heightOffset = -heightOffset
          }
          if (left < 0) {
            left = 0
          }
          if (left >= width - widthOffset) {
            left = width - widthOffset
          }
          if (top <= 0) {
            top = y + 10
          }

          maskContext.fillRect(left, top, widthOffset, heightOffset)

          maskContext.fillStyle = side === 'buy' ? buyFillColor : sellFillColor
          maskContext.textAlign = 'left'
          maskContext.shadowBlur = 0
          maskContext.font = '12px Arial'
          const marginLeft = 10
          const marginTop = 25
          const lineHeight = 20
          maskContext.fillText(`委托价：${utils.toThousand(obj.price)}`, left + marginLeft, top + marginTop)
          maskContext.fillText(`累计：${utils.toThousand(obj.total)}`, left + marginLeft, top + marginTop + lineHeight)
          maskContext.closePath()
          break
        }
      }
    },
    onMouseOut () {
      const maskContext = this.maskContext
      const width = this.fWidth
      const height = this.fHeight
      maskContext.clearRect(0, 0, width, height)
    }
  },
  mounted () {
    this._initChart()
  },
  destroyed () {
    this._resetChart()
  }
}
</script>
<style lang="css" scoped>

canvas {
  position: absolute;
}
.deepth-chart-layout {
  position:relative;
  width: 100%;
  padding-top: 10px;
  /* overflow: hidden; */
}
.chart, .chart-mask {
  top: 0;
  left: 0;
  /* background: transparent; */
}
.chart-x {
  height: 24px;
}
.chart-y {
  width: 48px;
}

</style>
