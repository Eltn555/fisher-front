export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initData: string
  initDataUnsafe: {
    user?: {
      first_name?: string
      last_name?: string
    }
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export {}
