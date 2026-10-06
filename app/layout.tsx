import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['700', '800'], display: 'swap' })
import './globals.css'
import { loadSiteTheme, buildThemeStyleTag, buildGa4Snippet, isWidgetHidden } from '@/lib/theme-loader'
import { AnimatedBg } from '@/components/AnimatedBg'
import ConsentBanner from '@/components/ConsentBanner'
import Logo from '@/components/Logo'
import Link from 'next/link'
import OwnerAssistant from '@/components/OwnerPanel'
import AuthButton from '@/components/AuthButton'
import FeedbackWidget from '@/components/FeedbackWidget'
import ChatBot from '@/components/ChatBot'

import { MotionProvider } from "@infosiva/shared-ui/modern";
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

const DEFAULTS = { background: '#fffbf5', primary: '#f0bc42', secondary: '#8a5d00' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await loadSiteTheme('anylocal')
  const themeCss = buildThemeStyleTag(theme, DEFAULTS)
  const ga4 = buildGa4Snippet(theme)
  const ga4Id = theme?.analytics?.ga4Id
  return (
    <html lang="en" className="h-full" data-layout={theme?.layout?.archetype ?? 'map-first'} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4237294630161176" crossOrigin="anonymous" strategy="afterInteractive" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {ga4 && ga4Id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
            <script dangerouslySetInnerHTML={{ __html: ga4 }} />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${jakartaSans.variable} min-h-full flex flex-col`}
        style={{ background: 'var(--background, #fffbf5)', color: '#0f1419', fontFamily: 'var(--font-body, system-ui)', overflowX: 'hidden' }}>
        <AnimatedBg theme={theme} fallback="none" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body { overflow-x: hidden; max-width: 100%; }
          h1, h2, h3, .font-display { font-family: var(--font-display, system-ui) !important; }
          img, video { max-width: 100%; }
          .cat-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
          .cat-scroll::-webkit-scrollbar { display: none; }
          .local-card { transition: transform 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 180ms, border-color 180ms; }
          .local-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(15,20,25,0.12); border-color: rgba(240,188,66,0.7) !important; }
          .search-bar:focus-within { border-color: #f0bc42 !important; box-shadow: 0 0 0 3px rgba(240,188,66,0.25) !important; }
          .al-nav a { min-height: 44px; display: inline-flex; align-items: center; }
          @media (max-width: 640px) { .al-hide-sm { display: none !important; } }
          .al-btn:active { transform: scale(0.97); }
          a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid #8a5d00; outline-offset: 2px; }
          @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
        `}</style>
        <MotionProvider>
          <nav className="al-nav" style={{ position: 'sticky', top: 0, zIndex: 40, background: '#0f1419', borderBottom: '1px solid rgba(240,188,66,0.25)' }}>
            <div style={{ maxWidth: 1152, margin: '0 auto', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <Link href="/" aria-label="AnyLocal home" style={{ textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}><Logo /></Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, fontWeight: 600 }}>
                <Link href="/search" className="al-hide-sm" style={{ color: '#fffbf5', textDecoration: 'none' }}>Search</Link>
                <Link href="/for-businesses" style={{ color: '#fffbf5', textDecoration: 'none' }}>For businesses</Link>
                <AuthButton />
              </div>
            </div>
          </nav>
          <main style={{ flex: 1 }}>{children}</main>
          <footer style={{ background: '#0f1419', color: 'rgba(255,251,245,0.75)', padding: '28px 16px', fontSize: 13 }}>
            <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo size={24} />
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <Link href="/search" style={{ color: 'inherit' }}>Search</Link>
                <Link href="/for-businesses" style={{ color: 'inherit' }}>For businesses</Link>
                <Link href="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
              </div>
              <span>&copy; {new Date().getFullYear()} AnyLocal</span>
            </div>
          </footer>
          <OwnerAssistant />
          {!isWidgetHidden(theme, 'chatbot') && <ChatBot />}
          <FeedbackWidget siteName="AnyLocal" position="left" accentColor="#f0bc42" accentColor2="#f0bc42" />
        </MotionProvider>
        <ConsentBanner />
      </body>
    </html>
  )
}
