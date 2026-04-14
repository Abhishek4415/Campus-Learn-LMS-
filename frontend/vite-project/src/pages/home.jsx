import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Brain, Users, Star, ArrowRight, CheckCircle,
  TrendingUp, Award, Zap, Shield, Clock, MessageSquare,
  GraduationCap, Target, Sparkles, ChevronRight
} from 'lucide-react'
import API from '../services/api'

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  .font-display { font-family: 'Instrument Serif', Georgia, serif; }
  .font-sans-custom { font-family: 'Sora', sans-serif; }

  body, .home-root {
    font-family: 'Sora', sans-serif;
    background: #f7f5f0;
    color: #1c1917;
  }

  /* ── Accent ── */
  .accent { color: #c45c26; }
  .accent-bg { background: #c45c26; }
  .accent-border { border-color: #c45c26; }

  /* ── Ticker ── */
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-track { animation: ticker 22s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }

  /* ── Fade-up on load ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up-1 { animation: fadeUp 0.7s ease forwards; }
  .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
  .fade-up-3 { animation: fadeUp 0.7s 0.30s ease both; }
  .fade-up-4 { animation: fadeUp 0.7s 0.45s ease both; }

  /* ── Feature hover ── */
  .feat-card {
    border: 1.5px solid #e8e4dc;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .feat-card:hover {
    border-color: #c45c26;
    box-shadow: 4px 4px 0 #c45c26;
    transform: translate(-2px, -2px);
  }
  .feat-card.is-active {
    border-color: #c45c26;
    box-shadow: 4px 4px 0 #c45c26;
    transform: translate(-2px, -2px);
  }

  /* ── Stat pill ── */
  .stat-pill {
    border: 1.5px solid #e8e4dc;
    transition: background 0.2s;
  }
  .stat-pill:hover { background: #1c1917; color: #f7f5f0; }
  .stat-pill:hover .stat-label { color: #a8a29e; }

  /* ── Benefit row ── */
  .benefit-row {
    border-bottom: 1px solid #e8e4dc;
    transition: background 0.15s;
  }
  .benefit-row:hover { background: #eeebe4; }

  /* ── Testimonial ── */
  .tcard {
    border: 1.5px solid #e8e4dc;
    transition: box-shadow 0.2s;
  }
  .tcard:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.08); }

  /* ── CTA button ── */
  .btn-primary {
    background: #1c1917;
    color: #f7f5f0;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: #c45c26; transform: translateY(-1px); }

  .btn-outline {
    border: 1.5px solid #1c1917;
    color: #1c1917;
    transition: background 0.2s, color 0.2s;
  }
  .btn-outline:hover { background: #1c1917; color: #f7f5f0; }

  /* ── Nav ── */
  .home-nav {
    border-bottom: 1px solid #e8e4dc;
    background: rgba(247,245,240,0.92);
    backdrop-filter: blur(10px);
  }

  /* ── Divider line ── */
  .rule { border-color: #e8e4dc; }

  /* ── Section label ── */
  .section-label {
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #78716c;
  }

  /* ── Number badge ── */
  .num-badge {
    font-family: 'Instrument Serif', serif;
    font-size: 1.1rem;
    color: #c45c26;
    min-width: 2rem;
  }

  /* ── Hero tagline ── */
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1.5px solid #e8e4dc;
    border-radius: 2px;
    padding: 4px 12px;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #78716c;
  }
`

function Home() {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    API.get('/')
      .then(res => console.log(res.data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Notes',
      description: 'High-quality study materials uploaded by experienced teachers across all subjects — searchable, organised, always available.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get instant, thoughtful help with your questions through an intelligent assistant that actually understands your syllabus.',
    },
    {
      icon: Users,
      title: 'Group Collaboration',
      description: 'Connect with teachers and peers in real-time group chats — ask questions, share files, and learn together.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Follow your learning journey with clear analytics, streaks, and achievement milestones that keep you moving forward.',
    },
  ]

  const stats = [
    { number: '1,000+', label: 'Study Notes', icon: BookOpen },
    { number: '500+',   label: 'Active Students', icon: Users },
    { number: '50+',    label: 'Expert Teachers', icon: GraduationCap },
    { number: '95%',    label: 'Satisfaction Rate', icon: Star },
  ]

  const benefits = [
    { icon: Zap,           text: 'Lightning-fast access to study materials' },
    { icon: Shield,        text: 'Secure and private learning environment' },
    { icon: Clock,         text: 'Learn at your own pace, anytime' },
    { icon: MessageSquare, text: 'Real-time chat with teachers' },
    { icon: Target,        text: 'Personalised learning paths' },
    { icon: Award,         text: 'Track achievements and progress' },
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Computer Science Student',
      emoji: '👩‍🎓',
      text: 'CampusLearn transformed my study routine. The AI chatbot actually understands my questions — it feels like having a tutor on call.',
      rating: 5,
    },
    {
      name: 'Rahul Kumar',
      role: 'Engineering Student',
      emoji: '👨‍💻',
      text: 'Best platform for accessing notes and collaborating with classmates. The group chat makes it so easy to discuss problems in real time.',
      rating: 5,
    },
    {
      name: 'Prof. Anita Desai',
      role: 'Mathematics Teacher',
      emoji: '👩‍🏫',
      text: 'Sharing materials has never been easier. I can see exactly which topics my students struggle with and adjust accordingly.',
      rating: 5,
    },
  ]

  const tickerItems = [
    'Comprehensive Notes', 'AI Chatbot', 'Group Chat',
    'Progress Tracking', 'Expert Teachers', 'Free to Start',
    'Comprehensive Notes', 'AI Chatbot', 'Group Chat',
    'Progress Tracking', 'Expert Teachers', 'Free to Start',
  ]

  return (
    <div className="home-root min-h-screen">
      <style>{FONTS}</style>

      {/* ── Sticky Nav ── */}
      <nav className="home-nav sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 accent" />
          <span className="font-display text-xl" style={{ letterSpacing: '-0.01em' }}>CampusLearn</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-outline text-sm font-medium px-5 py-2 rounded-sm">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm font-medium px-5 py-2 rounded-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="fade-up-1 mb-6">
          <span className="hero-tag">
            <Sparkles className="h-3 w-3 accent" />
            AI-Powered Learning Platform
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <h1 className="font-display fade-up-2"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.04, letterSpacing: '-0.02em', color: '#1c1917' }}>
              Learn smarter,<br />
              <span className="accent italic">not harder.</span>
            </h1>
          </div>

          <div className="md:col-span-4 md:pb-3 fade-up-3">
            <p className="text-base leading-relaxed mb-8" style={{ color: '#57534e' }}>
              Comprehensive notes, instant AI help, and real-time collaboration with teachers and peers — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <Link to="/register"
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm text-sm font-semibold">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login"
                className="btn-outline inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm text-sm font-semibold">
                Sign in
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-5" style={{ color: '#78716c', fontSize: '0.78rem' }}>
              <CheckCircle className="h-3.5 w-3.5" style={{ color: '#c45c26' }} />
              <span>No credit card needed</span>
              <span className="mx-2">·</span>
              <CheckCircle className="h-3.5 w-3.5" style={{ color: '#c45c26' }} />
              <span>Free forever plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="overflow-hidden border-y rule py-3.5" style={{ background: '#1c1917' }}>
        <div className="ticker-track flex gap-10 whitespace-nowrap w-max">
          {tickerItems.map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: '#e7e5e4', letterSpacing: '0.06em' }}>
              <span className="accent">✦</span>
              {item.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="stat-pill rounded-sm p-6 cursor-default">
              <div className="font-display text-4xl md:text-5xl mb-1" style={{ letterSpacing: '-0.03em' }}>
                {stat.number}
              </div>
              <div className="stat-label text-sm" style={{ color: '#78716c' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="rule max-w-7xl mx-auto" style={{ margin: '0 3rem' }} />

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="section-label mb-3">Platform features</p>
            <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Everything you need<br />
              <span className="accent italic">to excel.</span>
            </h2>
          </div>
          <p className="text-sm max-w-xs" style={{ color: '#78716c', lineHeight: 1.7 }}>
            Built for students, designed with teachers — a complete ecosystem for campus learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveFeature(i)}
              className={`feat-card rounded-sm p-7 cursor-default bg-white ${activeFeature === i ? 'is-active' : ''}`}
            >
              <div className="flex items-start justify-between mb-8">
                <feature.icon className={`h-6 w-6 ${activeFeature === i ? 'accent' : ''}`}
                  style={{ color: activeFeature === i ? '#c45c26' : '#78716c' }} />
                <span className="num-badge">0{i + 1}</span>
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ letterSpacing: '-0.01em' }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="rule max-w-7xl mx-auto" style={{ margin: '0 3rem' }} />

      {/* ── Benefits ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="section-label mb-3">Why CampusLearn</p>
            <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Made for real<br />
              <span className="accent italic">students.</span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>
              We built every feature around actual learning needs — not feature checklists.
            </p>
          </div>

          <div className="md:col-span-8">
            {benefits.map((b, i) => (
              <div key={i} className="benefit-row flex items-center gap-5 py-5 px-3 rounded-sm cursor-default">
                <div className="flex-shrink-0 w-9 h-9 rounded-sm flex items-center justify-center"
                  style={{ background: '#eeebe4' }}>
                  <b.icon className="h-4 w-4" style={{ color: '#1c1917' }} />
                </div>
                <span className="text-sm font-medium">{b.text}</span>
                <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" style={{ color: '#d6d3cd' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule max-w-7xl mx-auto" style={{ margin: '0 3rem' }} />

      {/* ── Testimonials ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="mb-12">
          <p className="section-label mb-3">Community</p>
          <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Heard from our<br />
            <span className="accent italic">community.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="tcard rounded-sm p-8 bg-white flex flex-col gap-5">
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" style={{ color: '#c45c26' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#44403c' }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #e8e4dc' }}>
                <div className="w-10 h-10 rounded-sm flex items-center justify-center text-xl"
                  style={{ background: '#eeebe4' }}>
                  {t.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs" style={{ color: '#78716c' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-6 md:mx-12 mb-16 rounded-sm overflow-hidden"
        style={{ background: '#1c1917' }}>
        <div className="max-w-7xl mx-auto px-10 md:px-16 py-20 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <p className="section-label mb-4" style={{ color: '#78716c' }}>Get started today</p>
            <h2 className="font-display text-white text-4xl md:text-6xl"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.06 }}>
              Your learning,<br />
              <span style={{ color: '#c45c26' }} className="italic">upgraded.</span>
            </h2>
          </div>
          <div className="flex-shrink-0">
            <Link to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-sm text-sm font-semibold"
              style={{ background: '#c45c26', color: '#fff' }}>
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs mt-4" style={{ color: '#78716c' }}>
              No credit card · Free forever plan
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 accent" />
              <span className="font-display text-xl">CampusLearn</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#78716c' }}>
              Empowering students with AI-driven education and comprehensive learning resources.
            </p>
          </div>

          <div>
            <p className="section-label mb-4">Platform</p>
            <ul className="space-y-3">
              {['Home', 'Features', 'Pricing', 'About Us'].map(link => (
                <li key={link}>
                  <Link to="/" className="text-sm hover:accent transition-colors" style={{ color: '#78716c' }}>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-label mb-4">Support</p>
            <ul className="space-y-3">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm transition-colors" style={{ color: '#78716c' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 rule border-t">
          <p className="text-xs" style={{ color: '#a8a29e' }}>© 2024 CampusLearn. All rights reserved.</p>
          <div className="flex gap-6 text-xs" style={{ color: '#a8a29e' }}>
            <a href="#" className="hover:text-current transition-colors">Privacy</a>
            <a href="#" className="hover:text-current transition-colors">Terms</a>
            <a href="#" className="hover:text-current transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
