import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Brain, Users, Star, ArrowRight, CheckCircle,
  TrendingUp, Award, Zap, Shield, Clock, MessageSquare,
  GraduationCap, Target, Sparkles, ChevronRight
} from 'lucide-react'
import API from '../services/api'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,600&display=swap');

  .home-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fu1 { animation: fadeUp 0.6s ease both; }
  .fu2 { animation: fadeUp 0.6s 0.12s ease both; }
  .fu3 { animation: fadeUp 0.6s 0.24s ease both; }
  .fu4 { animation: fadeUp 0.6s 0.36s ease both; }

  .feat-card {
    border: 1px solid rgba(99,102,241,0.12);
    transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
    position: relative;
    overflow: hidden;
  }
  .feat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.22s;
  }
  .feat-card:hover::before, .feat-card.active::before { opacity: 1; }
  .feat-card:hover, .feat-card.active {
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 8px 32px rgba(99,102,241,0.12);
    transform: translateY(-3px);
  }

  .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(99,102,241,0.13); }

  .benefit-item { transition: background 0.18s, transform 0.18s; }
  .benefit-item:hover {
    background: linear-gradient(90deg, rgba(99,102,241,0.06), transparent);
    transform: translateX(4px);
  }

  .t-card { transition: transform 0.22s, box-shadow 0.22s; }
  .t-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.1); }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #4f46e5;
  }

  .g-text {
    background: linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .ticker-wrap { overflow: hidden; }
  .ticker-inner { display: flex; width: max-content; animation: ticker 20s linear infinite; }
  .ticker-inner:hover { animation-play-state: paused; }

  .s-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #6366f1;
  }

  .feat-num {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #6366f1;
    opacity: 0.6;
  }
`

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    API.get('/')
      .then(res => console.log(res.data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3000)
    return () => clearInterval(id)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Notes',
      description: 'High-quality study materials from experienced teachers — organised, searchable, always available.',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Instant, thoughtful help via an intelligent assistant that actually understands your coursework.',
      gradient: 'from-violet-500 to-indigo-400',
    },
    {
      icon: Users,
      title: 'Group Collaboration',
      description: 'Real-time group chats with teachers and peers — ask questions, share files, stay in sync.',
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Clear analytics and achievement milestones to keep your learning moving forward.',
      gradient: 'from-orange-500 to-rose-400',
    },
  ]

  const stats = [
    { number: '1,000+', label: 'Study Notes',     icon: BookOpen      },
    { number: '500+',   label: 'Active Students',  icon: Users         },
    { number: '50+',    label: 'Expert Teachers',  icon: GraduationCap },
    { number: '95%',    label: 'Satisfaction',     icon: Star          },
  ]

  const benefits = [
    { icon: Zap,           text: 'Lightning-fast access to study materials' },
    { icon: Shield,        text: 'Secure and private learning environment'  },
    { icon: Clock,         text: 'Learn at your own pace, anytime'          },
    { icon: MessageSquare, text: 'Real-time chat with teachers'             },
    { icon: Target,        text: 'Personalised learning paths'              },
    { icon: Award,         text: 'Track achievements and progress'          },
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Computer Science Student',
      emoji: '👩‍🎓',
      text: 'CampusLearn transformed my study routine. The AI chatbot is incredibly helpful — it feels like a tutor on call.',
      rating: 5,
    },
    {
      name: 'Rahul Kumar',
      role: 'Engineering Student',
      emoji: '👨‍💻',
      text: 'Best platform for accessing notes and collaborating with classmates. The group chat is a game-changer.',
      rating: 5,
    },
    {
      name: 'Prof. Anita Desai',
      role: 'Mathematics Teacher',
      emoji: '👩‍🏫',
      text: 'Sharing materials has never been easier. I can see exactly where my students need more support.',
      rating: 5,
    },
  ]

  const tickerItems = [
    'Comprehensive Notes', 'AI Chatbot', 'Group Chat',
    'Progress Tracking', 'Expert Teachers', 'Free to Start',
  ]

  return (
    <div className="home-root min-h-screen bg-white">
      <style>{STYLES}</style>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #eff6ff 0%, #eef2ff 50%, #f5f3ff 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #818cf8, #2563eb)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #a78bfa, #ec4899)', transform: 'translate(-30%, 30%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-36">
          <div className="fu1 mb-7 flex justify-center">
            <span className="pill">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              AI-Powered Learning Platform
            </span>
          </div>

          <h1 className="fu2 text-center font-extrabold leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', letterSpacing: '-0.025em', color: '#0f172a' }}>
            Transform Your<br />
            <span className="g-text">Learning Journey</span>
          </h1>

          <p className="fu3 text-center max-w-2xl mx-auto mb-10 text-lg leading-relaxed" style={{ color: '#475569' }}>
            Access comprehensive study materials, get instant AI assistance,
            and collaborate with teachers and peers — all in one place.
          </p>

          <div className="fu4 flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link to="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 shadow-sm">
              Sign In
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-sm" style={{ color: '#64748b' }}>
            {['No credit card required', 'Free forever plan', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker-wrap border-y border-indigo-100 py-3.5 bg-white">
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-3 pr-10 text-xs font-semibold tracking-widest uppercase text-indigo-400">
              <span className="text-indigo-300">◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <div key={i} className="stat-card rounded-2xl p-6 text-center cursor-default bg-white border border-slate-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold mb-1" style={{ letterSpacing: '-0.03em', color: '#0f172a' }}>
                  {s.number}
                </div>
                <div className="text-sm font-medium" style={{ color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <p className="s-label mb-3">Platform Features</p>
            <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#0f172a' }}>
              Everything you need to <span className="g-text">excel</span>
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: '#475569' }}>
              Powerful features designed to make learning more effective and enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setActiveFeature(i)}
                className={`feat-card rounded-2xl p-7 bg-white cursor-default ${activeFeature === i ? 'active' : ''}`}>
                <div className="flex items-start justify-between mb-7">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} shadow-md`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="feat-num">0{i + 1}</span>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                  {f.description}
                </p>
                <div className="mt-5 flex items-center gap-1 text-indigo-500 text-sm font-semibold"
                  style={{ opacity: activeFeature === i ? 1 : 0, transition: 'opacity 0.2s' }}>
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="s-label mb-3">Why CampusLearn</p>
              <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Why students <span className="g-text">love us</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#475569' }}>
                Every feature is built around real learning needs — not a feature checklist.
              </p>
              <Link to="/register"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
                Join for free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-2">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item flex items-center gap-4 p-4 rounded-xl cursor-default">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}>
                    <b.icon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#334155' }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <p className="s-label mb-3">Community</p>
            <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#0f172a' }}>
              What our community <span className="g-text">says</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="t-card rounded-2xl p-8 bg-white border border-slate-100 shadow-sm">
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-7" style={{ color: '#475569' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}>
                    {t.emoji}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#0f172a' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl bg-white" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl bg-white" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-extrabold text-white mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Ready to transform your learning?
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Join thousands of students already achieving their academic goals with CampusLearn.
          </p>
          <Link to="/register"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl text-base font-bold text-indigo-600 bg-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Start Learning Today
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No credit card required · Free forever plan · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">CampusLearn</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                Empowering students with AI-driven education and comprehensive learning resources.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#64748b' }}>Platform</p>
              <ul className="space-y-3">
                {['Home', 'Features', 'Pricing', 'About Us'].map(l => (
                  <li key={l}>
                    <Link to="/" className="text-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#64748b' }}>Support</p>
              <ul className="space-y-3">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-800">
            <p className="text-xs" style={{ color: '#475569' }}>© 2024 CampusLearn. All rights reserved.</p>
            <div className="flex gap-6 text-xs" style={{ color: '#475569' }}>
              {['Privacy', 'Terms', 'Cookies'].map(l => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
