export interface LocalCategory {
  id: string; label: string; icon: string; synonyms: string[]
}

export interface AnyLocalConfig {
  id: string; name: string; tagline: string; domain: string; themeColor: string
  metaTitle: string; metaDescription: string; keywords: string[]
  aiSystemPrompt: string
  categories: LocalCategory[]
}

const config: AnyLocalConfig = {
  id: 'anylocal',
  name: 'AnyLocal',
  tagline: 'Find anything local, anywhere — AI-ranked by real reviews',
  domain: 'anylocal.app',
  themeColor: 'orange',
  metaTitle: 'AnyLocal — Find Anything Near You, Anywhere in the World',
  metaDescription: 'AI-powered local search. Find restaurants, hotels, plumbers, dentists and more — ranked by honest AI review analysis, not just star ratings.',
  keywords: ['find local', 'near me', 'restaurant finder', 'plumber near me', 'local business', 'AI reviews', 'best local'],
  aiSystemPrompt: `You are a helpful assistant for AnyLocal, a platform that helps people find trusted local businesses anywhere in the world.
When users ask to find a place or service, extract the business type and location from their message.
When you have results, give an honest AI summary of what the reviews say — quality, service, value, reliability, atmosphere.
Be concise and direct. Mention both positives and negatives if present. Always suggest calling or visiting directly.`,
  categories: [
    // Food & Drink
    { id: 'restaurant',   label: 'Restaurants',    icon: '🍽️', synonyms: ['food','dining','eat','cuisine','takeaway'] },
    { id: 'cafe',         label: 'Cafes',          icon: '☕', synonyms: ['coffee','cafe','brunch','bakery'] },
    { id: 'pub',          label: 'Pubs & Bars',    icon: '🍺', synonyms: ['bar','pub','drinks','nightlife'] },
    // Stays
    { id: 'hotel',        label: 'Hotels',         icon: '🏨', synonyms: ['hotel','accommodation','stay','motel','resort'] },
    { id: 'guesthouse',   label: 'Guesthouses',    icon: '🏡', synonyms: ['guesthouse','b&b','bed and breakfast','airbnb'] },
    // Home Trades
    { id: 'plumber',      label: 'Plumbers',       icon: '🔧', synonyms: ['plumbing','pipe','leak','boiler'] },
    { id: 'electrician',  label: 'Electricians',   icon: '⚡', synonyms: ['electrical','wiring','socket','fuse'] },
    { id: 'builder',      label: 'Builders',       icon: '🏗️', synonyms: ['building','construction','extension','renovation'] },
    { id: 'cleaner',      label: 'Cleaners',       icon: '🧹', synonyms: ['cleaning','housekeeping','maid'] },
    { id: 'hvac',         label: 'HVAC / Heating', icon: '❄️', synonyms: ['air conditioning','heating','boiler','heat pump'] },
    // Health
    { id: 'dentist',      label: 'Dentists',       icon: '🦷', synonyms: ['dental','dentist','teeth','orthodontist'] },
    { id: 'doctor',       label: 'Doctors',        icon: '🩺', synonyms: ['gp','doctor','clinic','medical','physician'] },
    { id: 'pharmacy',     label: 'Pharmacies',     icon: '💊', synonyms: ['pharmacy','chemist','drugs','prescription'] },
    { id: 'gym',          label: 'Gyms',           icon: '🏋️', synonyms: ['gym','fitness','workout','crossfit','yoga'] },
    // Beauty & Lifestyle
    { id: 'salon',        label: 'Hair Salons',    icon: '💇', synonyms: ['hairdresser','salon','barber','haircut'] },
    { id: 'spa',          label: 'Spas',           icon: '💆', synonyms: ['spa','massage','beauty','facial','wellness'] },
    // Professional
    { id: 'lawyer',       label: 'Lawyers',        icon: '⚖️', synonyms: ['solicitor','lawyer','legal','attorney','law'] },
    { id: 'accountant',   label: 'Accountants',    icon: '🧾', synonyms: ['accountant','tax','bookkeeping','financial'] },
    { id: 'estate-agent', label: 'Estate Agents',  icon: '🏠', synonyms: ['estate agent','realtor','property','letting'] },
    // Auto
    { id: 'mechanic',     label: 'Mechanics',      icon: '🚗', synonyms: ['mechanic','garage','car repair','MOT','tyres'] },
    { id: 'car-wash',     label: 'Car Washes',     icon: '🚿', synonyms: ['car wash','valeting','detailing'] },
    // Shopping & Other
    { id: 'supermarket',  label: 'Supermarkets',   icon: '🛒', synonyms: ['supermarket','grocery','food shop'] },
    { id: 'school',       label: 'Schools',        icon: '🏫', synonyms: ['school','nursery','college','tutoring'] },
    { id: 'vet',          label: 'Vets',           icon: '🐾', synonyms: ['vet','veterinary','pet','animal'] },
  ],
}

export default config
