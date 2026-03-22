export interface TimezoneEntry {
  city: string
  country: string
  timezone: string
  region: string
}

export interface FavouriteLocation extends TimezoneEntry {
  id: string
  color?: string
}

export interface AppSettings {
  showSeconds: boolean
}
