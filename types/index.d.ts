import {Vue, VueConstructor} from 'vue/types/vue'

export enum OrderType  {
  Sell = 'sell',
  Buy = 'buy'
}

export class OrderBookItem<T> {
  price: number
  amount: number
}
export class Orderbook {
  buy: OrderBookItem<OrderType.Buy>[]
  sell: OrderBookItem<OrderType.Sell>[]
}

export class VDepthChart extends Vue {
  /**
   * 数据对象
   */
  data: Orderbook

  options: VChartOptions

  width: string

  height: string

  bgColor: string

  buyFillColor: string

  sellFillColor: string

  gap: number

  axisFontsize: number

  /**
   * 锯齿
   */
  jagged: boolean
  
  paddingTop: number

  tipsPrice: string

  tipsTotal: string
}

export interface VChartOptions {

}

export declare function install(Vue: VueConstructor, options: VChartOptions): void;