export interface RateChangeJobPayload {
  productId: string
  productName: string
  bankName: string
  oldRateMin: number
  oldRateMax: number
  newRateMin: number
  newRateMax: number
}

export interface INotificationQueue {
  addRateChangeJob(payload: RateChangeJobPayload): Promise<void>
}
