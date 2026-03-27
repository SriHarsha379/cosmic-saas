'use client';

import { ClipboardList, CheckCircle, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const evaluationTypes = [
  {
    icon: '📝',
    title: 'Technical Assessment',
    desc: 'Test your coding skills with AI-generated challenges across 25+ languages.',
    tags: ['Coding', 'Algorithms', 'Data Structures'],
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    icon: '🎯',
    title: 'Behavioral Evaluation',
    desc: 'Practice STAR-method responses to common behavioral interview questions.',
    tags: ['Communication', 'Leadership', 'Teamwork'],
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    icon: '🚀',
    title: 'Domain Knowledge',
    desc: 'Assess your expertise in specific domains and technologies with AI feedback.',
    tags: ['Any Domain', 'AI Generated', 'Adaptive'],
    gradient: 'from-emerald-600 to-teal-600',
  },
];

const howItWorks = [
  'Choose Assessments or Tests',
  'Enter job details & requirements',
  'AI generates personalized questions',
  'Take the assessment at your pace',
  'Get instant detailed feedback',
];

export default function SelfEvaluationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Self-Evaluation Center</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Master your skills with AI-powered training and self-assessment tools
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all">
            <Zap className="w-4 h-4 text-yellow-400" />
            Practice Daily
          </button>
        </div>
      </div>

      {/* Track Progress Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Track your Progress</h3>
              <p className="text-sm text-gray-400">
                View your stats, history, and detailed results from Mock Interviews and assessments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/results')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 rounded-lg text-xs text-gray-300 hover:text-white transition-all border border-white/8"
            >
              <TrendingUp className="w-3 h-3" /> Stats
            </button>
            <button
              onClick={() => router.push('/results')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 rounded-lg text-xs text-gray-300 hover:text-white transition-all border border-white/8"
            >
              Results
            </button>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Evaluation Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {evaluationTypes.map((ev) => (
          <div
            key={ev.title}
            className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ev.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}
            >
              {ev.icon}
            </div>
            <h3 className="text-base font-semibold text-white mb-2">{ev.title}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-1">{ev.desc}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {ev.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/8 rounded-full text-xs text-gray-400 border border-white/8"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push('/tests')}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${ev.gradient} text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all`}
            >
              Start Evaluation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* How It Works + Self-Evaluation Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Self-Evaluation */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Self-Evaluation</h3>
              <p className="text-sm text-gray-400">Generate AI-powered assessments for any job role</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Generate personalized AI-powered assessments to practice for any job role. Get
            detailed feedback and improve your skills.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Assessments', 'Tests', 'Any Domain'].map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 bg-white/8 rounded-full text-xs text-gray-400 border border-white/8"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
            <span>
              <span className="text-white font-semibold">2 Options</span> types
            </span>
            <span>
              <span className="text-purple-400 font-semibold">AI Generated</span> mode
            </span>
          </div>
          <button
            onClick={() => router.push('/tests')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all"
          >
            Start Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* How It Works */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-5">How It Works</h3>
          <div className="space-y-3">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-300">{step}</p>
                {i < howItWorks.length - 1 && (
                  <CheckCircle className="w-4 h-4 text-emerald-500/60 ml-auto flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
