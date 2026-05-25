export const REALMS = [
  'Tartarus',
  'Gaia',
  'Midgard',
  'Asgard',
  'Valhalla',
  'Elysium',
  'Prometheon',
] as const

export type RealmName = (typeof REALMS)[number]
