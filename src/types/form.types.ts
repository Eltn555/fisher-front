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