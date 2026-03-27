'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, Code2, Shield, BarChart2, Clock, ChevronDown,
  ChevronRight, ArrowRight, Check, Cpu, Eye, FileSearch,
  Video, Rocket, Star, TrendingUp, Users, Lock,
  Sparkles, Menu, X, CheckCircle, Award, Globe,
  LayoutDashboard, Play,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────────── */
/*  DATA                                                              */
/* ────────────────────────────────────────────────────────────────── */

const heroFeatures = [
  { icon: Code2,    label: 'Advanced Code Analysis' },
  { icon: Eye,      label: 'Real-time AI Proctoring' },
  { icon: BarChart2,label: 'Performance Insights' },
  { icon: Zap,      label: 'Instant Evaluation' },
];

const stats = [
  { value: '25+',   label: 'Assessment Mastery',  sub: 'Programming languages supported',   icon: Code2 },
  { value: '99.9%', label: 'AI Precision',         sub: 'Advanced proctoring accuracy',       icon: Eye },
  { value: '<1s',   label: 'Lightning Speed',      sub: 'Real-time code execution',           icon: Zap },
];

const whyChoose = [
  { icon: '⚡', title: 'One Prompt to Hire',              desc: 'Generate complete assessments with a single AI prompt' },
  { icon: '🎯', title: 'Generate Customized Interviews',  desc: 'Tailor assessments for any role across industries' },
  { icon: '🧠', title: 'Test All Competencies',           desc: 'Evaluate Behavioral, Technical & Managerial skills in one test' },
  { icon: '🏆', title: 'Hire the Best, from the Rest',    desc: 'AI-powered ranking to find top performers instantly' },
  { icon: '🛡️', title: 'Zero Cheating Tolerance',         desc: 'AI proctoring ensures 100% integrity in assessments' },
  { icon: '🚀', title: 'Enterprise Ready',                desc: 'Scales from startups to Fortune 500 companies effortlessly' },
];

const assessmentTools = [
  {
    icon: Eye,
    title: 'AI-Powered Proctoring',
    desc: 'Advanced AI monitoring system to ensure test integrity and prevent cheating in real-time',
    gradient: 'from-purple-600 to-blue-600',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Zap,
    title: 'Instant Evaluation',
    desc: 'Automated code evaluation and scoring with detailed performance metrics and insights',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
  },
  {
    icon: FileSearch,
    title: 'Plagiarism Detection',
    desc: 'Sophisticated code similarity checking and source verification tools',
    gradient: 'from-emerald-600 to-cyan-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Video,
    title: 'Video Monitoring',
    desc: 'Secure remote proctoring with audio-video recording and environment scanning',
    gradient: 'from-pink-600 to-rose-600',
    bg: 'bg-pink-500/10',
  },
];

const journeyItems = [
  {
    num: '01',
    title: 'Analytics Dashboard',
    sub: 'Real-time Intelligence Hub',
    desc: 'Our advanced analytics dashboard transforms raw assessment data into actionable insights. Track candidate performance in real-time, identify skill gaps instantly, and make data-driven hiring decisions with confidence.',
    features: [
      'Interactive performance visualization with 20+ chart types',
      'Real-time candidate monitoring with live progress tracking',
      'Skill gap analysis using AI-powered pattern recognition',
      'Exportable reports in multiple formats (PDF, Excel, CSV)',
    ],
    gradient: 'from-purple-600 to-blue-600',
    icon: BarChart2,
  },
  {
    num: '02',
    title: 'Custom Certificates',
    sub: 'Digital Achievement Recognition',
    desc: 'Automatically generate beautiful, secure certificates for successful candidates. Our certificate system uses blockchain verification for authenticity and includes QR codes for instant verification.',
    features: [
      'Blockchain-verified certificates with tamper-proof security',
      'Custom branding with your company logo and color scheme',
      'QR code verification for instant authenticity checking',
      'Automatic delivery via email with PDF and digital wallet formats',
    ],
    gradient: 'from-amber-500 to-orange-600',
    icon: Award,
  },
  {
    num: '03',
    title: 'Advanced Code Analysis',
    sub: 'Deep Code Intelligence',
    desc: 'Go beyond basic code execution with our sophisticated analysis engine. We evaluate code quality, efficiency, maintainability, and adherence to best practices.',
    features: [
      'Multi-language support for 25+ programming languages',
      'Big O complexity analysis with performance optimization suggestions',
      'Code quality metrics including maintainability index',
      'Security vulnerability detection and reporting',
    ],
    gradient: 'from-emerald-500 to-cyan-600',
    icon: Code2,
  },
  {
    num: '04',
    title: 'Enterprise Security',
    sub: 'Bank-Grade Protection',
    desc: 'Your assessment data is protected by military-grade encryption and enterprise security protocols. We maintain SOC 2 Type II compliance, GDPR compliance.',
    features: [
      'AES-256 encryption for data at rest and in transit',
      'SOC 2 Type II and GDPR compliance certification',
      'Multi-factor authentication with SSO integration',
      'Comprehensive audit trails with 7-year data retention',
    ],
    gradient: 'from-pink-600 to-rose-600',
    icon: Shield,
  },
];

const howItWorksSteps = [
  {
    step: '1',
    title: 'Create Assessment',
    desc: 'Design custom tests with coding challenges and MCQs tailored to your needs. Set time limits, difficulty levels, and choose from our vast question bank.',
    gradient: 'from-purple-600 to-blue-600',
  },
  {
    step: '2',
    title: 'Invite Candidates',
    desc: 'Share test links with candidates or integrate with your existing workflow. Manage invites and track candidate responses all in one place.',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    step: '3',
    title: 'Take Test',
    desc: 'Candidates solve problems in a secure, proctored environment with real-time code execution and anti-cheating measures in place.',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    step: '4',
    title: 'Get Results',
    desc: 'Receive detailed analytics and insights on candidate performance. Compare scores, review code quality, and make data-driven hiring decisions.',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const faqs = [
  {
    category: 'Getting Started',
    question: 'How do I get started with the platform?',
    answer: 'Simply sign up for a free account, complete your profile, and you can immediately start taking tests or joining hackathons. Our onboarding wizard will guide you through the key features step by step.',
  },
  {
    category: 'Technical',
    question: 'What programming languages do you support?',
    answer: 'We support 25+ programming languages including Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, Kotlin, Swift, and many more. Our code execution engine handles all major languages used in modern development.',
  },
  {
    category: 'Assessment',
    question: 'How does the code assessment work?',
    answer: 'Our AI-powered engine evaluates your code on multiple dimensions: correctness, efficiency (Big O), code quality, readability, and best practices. Results are available instantly with detailed feedback on each metric.',
  },
  {
    category: 'Security',
    question: 'What anti-cheating measures are in place?',
    answer: 'We use AI-powered proctoring that monitors tab switching, copy-paste behaviour, and suspicious activity. Video monitoring and plagiarism detection add further layers. Zero tolerance for cheating is enforced automatically.',
  },
  {
    category: 'Customization',
    question: 'Can I customize the test environment?',
    answer: 'Yes! You can set custom time limits, choose difficulty levels, pick specific topics or skills, and even add your own questions. Enterprise users can fully white-label the interface with custom branding.',
  },
  {
    category: 'Analytics',
    question: 'What kind of analytics and reporting do you provide?',
    answer: 'Our dashboard provides 20+ chart types including performance trends, skill heat maps, candidate comparison, and time-series analysis. Reports can be exported in PDF, Excel, or CSV format.',
  },
  {
    category: 'Pricing',
    question: 'Is there a limit to the number of tests I can create?',
    answer: 'Free accounts can create up to 3 tests per month. Pro accounts have unlimited test creation. Enterprise plans include custom limits, dedicated infrastructure, and SLA guarantees.',
  },
  {
    category: 'Quality',
    question: 'How do you ensure the quality of assessments?',
    answer: 'Our question bank is curated by industry experts and validated through thousands of real assessments. AI continuously improves question quality based on candidate performance data and feedback.',
  },
];

/* ────────────────────────────────────────────────────────────────── */
/*  COMPONENTS                                                        */
/* ────────────────────────────────────────────────────────────────── */

function FaqItem({ faq }: { faq: (typeof faqs)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl transition-all duration-300 cursor-pointer ${
        open ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/8 bg-white/3 hover:border-white/15'
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
          {faq.category}
        </span>
        <p className="text-sm font-medium text-white flex-1">{faq.question}</p>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </div>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-400 leading-relaxed pl-0">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  PAGE                                                              */
/* ────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setLoggedIn(true);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0E1330] to-[#1A0B2E]">
      {/* ── Sticky Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/40' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Cosmic SaaS</p>
              <p className="text-[10px] text-gray-500">Smart Assessment Platform</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tools"    className="hover:text-white transition-colors">Tools</a>
            <a href="#how"      className="hover:text-white transition-colors">How it Works</a>
            <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0B0F1A] border-t border-white/8 px-5 py-4 space-y-3">
            {['#features', '#tools', '#how', '#faq'].map((href, i) => (
              <a
                key={href}
                href={href}
                className="block text-sm text-gray-300 hover:text-white py-1.5"
                onClick={() => setMenuOpen(false)}
              >
                {['Features', 'Tools', 'How it Works', 'FAQ'][i]}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-white/8">
              {loggedIn ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link href="/auth/login"  className="flex-1 py-2 text-center text-sm text-gray-300 border border-white/15 rounded-xl">Sign In</Link>
                  <Link href="/auth/signup" className="flex-1 py-2 text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/6 border border-white/12 rounded-full mb-6 text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Advanced Code Analysis &amp; Real-time AI Proctoring
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
            Where{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Intelligence
            </span>
            <br />
            Meets Universe
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Streamline your evaluation workflow with our enterprise-grade platform featuring smart
            proctoring, real-time analytics, and comprehensive assessment tools.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {heroFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
              >
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                {label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push(loggedIn ? '/dashboard' : '/auth/signup')}
              className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 text-base"
            >
              <Rocket className="w-5 h-5" />
              Launch Into Space
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/6 border border-white/12 hover:bg-white/10 text-white font-medium rounded-2xl transition-all text-base"
            >
              <Play className="w-4 h-4" />
              Experience the Cosmos
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {stats.map(({ value, label, sub, icon: Icon }) => (
              <div
                key={label}
                className="text-center p-6 bg-white/4 border border-white/8 rounded-2xl hover:border-purple-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-4xl font-bold text-white mb-1 tabular-nums">{value}</p>
                <p className="text-sm font-semibold text-purple-400 mb-1">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 italic">
            The future of intelligent assessment starts here
          </p>
        </div>
      </section>

      {/* ── Why Choose ── */}
      <section id="features" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-400 mb-4">
              <Star className="w-3.5 h-3.5" /> Why Companies Choose Cosmic SaaS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for the Future of Hiring
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              One Prompt to Hire
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {whyChoose.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-5 bg-white/4 border border-white/8 rounded-2xl hover:border-purple-500/25 hover:bg-white/6 transition-all group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">
                  {icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assessment Tools ── */}
      <section id="tools" className="py-20 px-5 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-4">
              <Cpu className="w-3.5 h-3.5" /> Powerful Assessment Tools
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              State-of-the-art tools to make your<br className="hidden sm:block" /> assessment process efficient and secure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger">
            {assessmentTools.map(({ icon: Icon, title, desc, gradient, bg }) => (
              <div
                key={title}
                className="flex gap-4 p-5 bg-white/4 border border-white/8 rounded-2xl hover:border-white/15 hover:-translate-y-0.5 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Complete Assessment Journey ── */}
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The Complete Assessment Journey
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              From the moment a candidate clicks &ldquo;Start Assessment&rdquo; to receiving detailed analytics,
              every step is powered by cutting-edge technology.
            </p>
          </div>

          <div className="space-y-6">
            {journeyItems.map(({ num, title, sub, desc, features, gradient, icon: Icon }, idx) => (
              <div
                key={num}
                className={`flex flex-col lg:flex-row gap-6 p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-white/12 transition-all ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Icon side */}
                <div className="lg:w-64 flex-shrink-0 flex flex-col items-center lg:items-start justify-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl mb-3`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {num}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-1">{title}</h3>
                  <p className="text-sm text-gray-500">{sub}</p>
                </div>

                {/* Content side */}
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">{desc}</p>
                  <p className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                    Key Features:
                  </p>
                  <ul className="space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ready CTA ── */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-blue-600/30 to-indigo-700/40" />
            <div className="absolute inset-0 border border-purple-500/25 rounded-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Experience the Future of Assessment?
              </h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Join thousands of companies already using Cosmic SaaS to make better hiring decisions.
              </p>
              <button
                onClick={() => router.push(loggedIn ? '/dashboard' : '/auth/signup')}
                className="inline-flex items-center gap-2.5 bg-white text-purple-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-purple-50 transition-all shadow-xl text-base hover:-translate-y-0.5"
              >
                <Rocket className="w-5 h-5" />
                Start Your Assessment Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-20 px-5 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-4">
              <TrendingUp className="w-3.5 h-3.5" /> How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Transform your hiring process with our<br className="hidden sm:block" /> streamlined assessment workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            {howItWorksSteps.map(({ step, title, desc, gradient }) => (
              <div
                key={step}
                className="p-5 bg-white/4 border border-white/8 rounded-2xl hover:border-white/15 hover:-translate-y-1 transition-all duration-300 group text-center"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <span className="text-xl font-black text-white">{step}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">Find answers to common questions about our platform</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Cosmic SaaS</p>
                  <p className="text-[10px] text-gray-500">Smart Assessment Platform</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-4">
                Revolutionizing the future of assessment with AI-powered proctoring and comprehensive
                evaluation tools. Trusted by thousands of organizations worldwide.
              </p>
              <div className="flex items-center gap-2">
                {['📧 Stay Updated', '🔔 Get Notified'].map((t) => (
                  <span key={t} className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Quick Links
              </p>
              <ul className="space-y-2">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Tests',     href: '/tests' },
                  { label: 'Jobs',      href: '/jobs' },
                  { label: 'AI Hiring', href: '/ai-hiring' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" /> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Legal
              </p>
              <ul className="space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((t) => (
                  <li key={t}>
                    <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" /> {t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              © 2026 Cosmic SaaS. Made with ❤️ in India
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Available Worldwide
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> SOC 2 Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
