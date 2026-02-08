export interface MainFormData {
  date: string
  location: string
  oxygen: string
  temperature: string
  saturation: string
  pH: string
  feed: string
}

export interface ControlCatchData {
  date: string
  location: string
  catchKGs: number[]
}

export interface SalesData {
  date: string
  location: string
  type: string
  quantity: number
  kg: number
}

export interface FishStockingData {
  date: string
  location: string
  type: string
  quantity: number
  kg: number
}

export interface DeathReportData {
  date: string
  location: string
  data: {
    type: string
    kg: number
  }[]
}
