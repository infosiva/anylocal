import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'

const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['700', '800'], display: 'swap' })
import './globals.css'
import { getMeshStyle, getScrollbarColor, COLOR_MAP } from '@/lib/themeColors'
import Link from 'next/link'
import OwnerAssistant from '@/components/OwnerPanel'
import AuthButton from '@/components/AuthButton'
import AffiliateStrip from '@/components/AffiliateStrip'
import OnboardingTour from '@/components/OnboardingTour'
import FeedbackWidget from '@/components/FeedbackWidget'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title:       'AnyLocal — Find Anything Near You, Anywhere in the World',
  description: 'AI-powered local search. Find restaurants, hotels, plumbers, dentists and more — ranked by honest AI review analysis, not just star ratings.',
  keywords:    ['find local', 'near me', 'restaurant finder', 'plumber near me', 'local business', 'AI reviews'],
  metadataBase: new URL('https://anylocal.app'),
  openGraph: {
    title: 'AnyLocal — Find Anything Near You, Anywhere in the World',
    description: 'AI-powered local search. Find restaurants, hotels, plumbers, dentists and more — ranked by honest AI review analysis, not just star ratings.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnyLocal — Find Anything Near You, Anywhere in the World',
    description: 'AI-powered local search. Find restaurants, hotels, plumbers, dentists and more — ranked by honest AI review analysis, not just star ratings.',
    images: ['/og.png'],
  },
}

const themeColor = 'teal'
const colors     = COLOR_MAP[themeColor]
const meshStyle  = getMeshStyle(themeColor)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AnyLocal',
  url: 'https://anylocal.app',
  description: 'AI-powered local search. Find restaurants, hotels, plumbers, dentists and more — ranked by honest AI review analysis, not just star ratings.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://anylocal.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
      style={{
        '--theme-primary':   colors.primary,
        '--theme-secondary': colors.secondary,
        '--theme-base':      colors.base,
        '--scrollbar-color': getScrollbarColor(themeColor),
      } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} ${jakartaSans.variable} min-h-full flex flex-col`}
        style={{ background: 'var(--background, #fffbf5)', color: 'var(--foreground, #0f172a)', fontFamily: 'var(--font-body, system-ui)', overflowX: 'hidden' }}
      >
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html { overflow-x: hidden; max-width: 100%; }
          body { overflow-x: hidden; max-width: 100%; }
          h1, h2, h3, .font-display { font-family: var(--font-display, system-ui) !important; }
          img, video { max-width: 100%; }
          /* Horizontal category scroll — mobile only */
          .cat-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; -ms-overflow-style: none; }
          .cat-scroll::-webkit-scrollbar { display: none; }
          /* Stronger card lift */
          .local-card { transition: all 180ms cubic-bezier(0.23,1,0.32,1); }
          .local-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); border-color: rgba(13,148,136,0.35) !important; }
          /* Search bar pulse on focus */
          .search-bar:focus-within { border-color: rgba(13,148,136,0.45) !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.08) !important; }
          @media (max-width: 640px) {
            .desktop-grid { display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none; }
            .desktop-grid::-webkit-scrollbar { display: none; }
            .desktop-grid > * { flex-shrink: 0 !important; min-width: 100px !important; }
          }
        `}</style>
        <div style={meshStyle} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,251,245,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
              <span
                className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #0d9488, #0891b2)', flexShrink: 0 }}
                aria-hidden
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s7-6.5 7-11.5A7 7 0 005 9.5C5 14.5 12 21 12 21z" fill="white" />
                  <circle cx="12" cy="9.5" r="2" fill="#0d9488" />
                </svg>
              </span>
              <span style={{ color: '#0d9488' }}>AnyLocal</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="text-sm px-3 py-1.5 rounded-lg transition-colors hidden sm:block"
                style={{ color: 'rgba(26,26,26,0.6)' }}
              >
                My quotes
              </Link>
              <Link
                href="/for-businesses"
                className="text-sm px-3 py-1.5 rounded-lg transition-colors hidden sm:block"
                style={{ color: '#0d9488', border: '1px solid rgba(13,148,136,0.25)', borderRadius: 8 }}
              >
                For businesses
              </Link>
              <Link
                href="/search"
                className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: '#fff' }}
              >
                Search
              </Link>
              <AuthButton />
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {children}
        </main>

        <OnboardingTour />
        <OwnerAssistant />
        <AffiliateStrip />
        <FeedbackWidget siteName="AnyLocal" />

        <footer className="border-t py-10 px-6 mt-20" style={{ borderColor: 'rgba(0,0,0,0.08)', background: '#f5f0e8' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 font-bold mb-3" style={{ color: '#0d9488' }}>
                  <span className="text-xl">📍</span> AnyLocal
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.5)' }}>
                  Find any local business, anywhere in the world — with honest AI review analysis.
                </p>
              </div>
              <div>
                <div className="font-semibold text-sm mb-3" style={{ color: 'rgba(26,26,26,0.7)' }}>Food & Stays</div>
                <div className="flex flex-col gap-1.5 text-sm" style={{ color: 'rgba(26,26,26,0.5)' }}>
                  <Link href="/search?q=restaurants" className="hover:opacity-80 transition-opacity">Restaurants</Link>
                  <Link href="/search?q=hotels" className="hover:opacity-80 transition-opacity">Hotels</Link>
                  <Link href="/search?q=cafes" className="hover:opacity-80 transition-opacity">Cafes</Link>
                  <Link href="/search?q=pubs and bars" className="hover:opacity-80 transition-opacity">Pubs & Bars</Link>
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-3" style={{ color: 'rgba(26,26,26,0.7)' }}>Services</div>
                <div className="flex flex-col gap-1.5 text-sm" style={{ color: 'rgba(26,26,26,0.5)' }}>
                  <Link href="/search?q=plumbers" className="hover:opacity-80 transition-opacity">Plumbers</Link>
                  <Link href="/search?q=electricians" className="hover:opacity-80 transition-opacity">Electricians</Link>
                  <Link href="/search?q=dentists" className="hover:opacity-80 transition-opacity">Dentists</Link>
                  <Link href="/search?q=gyms" className="hover:opacity-80 transition-opacity">Gyms</Link>
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-3" style={{ color: 'rgba(26,26,26,0.7)' }}>Businesses</div>
                <div className="flex flex-col gap-1.5 text-sm" style={{ color: 'rgba(26,26,26,0.5)' }}>
                  <Link href="/for-businesses" style={{ color: '#0d9488' }} className="transition-colors font-medium hover:opacity-80">List your trade →</Link>
                  <Link href="/for-businesses#register" className="hover:opacity-80 transition-opacity">Register free</Link>
                  <Link href="/for-businesses" className="hover:opacity-80 transition-opacity">Pricing</Link>
                  <a href="mailto:hello@anylocal.app" className="hover:opacity-80 transition-opacity">Contact us</a>
                </div>
              </div>
            </div>
            <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'rgba(0,0,0,0.08)', color: 'rgba(26,26,26,0.4)' }}>
              <span>© {new Date().getFullYear()} AnyLocal. All rights reserved.</span>
              <span>Powered by Google Places + AI review analysis</span>
            </div>
          </div>
        </footer>
        <Script defer data-site="anylocal.app" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
