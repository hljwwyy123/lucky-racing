export type IPrize = {
  key: string
  prizeId: string
  prizeName: string
  prizeImage?: string
  prizeNum: number
  probability: any
  isSpecial?: boolean
}


export interface TableColumnProps {
  key: string
  title?: string
  align?: string
  sorter?: ((a: any, b: any) => number) | boolean | string
  render?: (rowData: any, rowIndex: number) => string | React.ReactNode
  fixed?: 'left' | 'right'
  width?: number
}