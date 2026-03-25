'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, ArrowRight, Send, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { TestQuestion, AnswerEntry } from '@/types';

function MCQQuestion({ question, answer, onAnswer }: { question: TestQuestion; answer: string; onAnswer: (a: string) => void }) {
  return (
    <div className="space-y-3">
      {question.options?.map((opt, i) => (
        <button
          key={i}
          onClick={() => onAnswer(opt)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
            answer === opt
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-200'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/8 hover:border-white/20'
          }`}
        >
          <span className="font-medium text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
          {opt}
        </button>
      ))}
    </div>
  );
}

function TrueFalseQuestion({ answer, onAnswer }: { answer: string; onAnswer: (a: string) => void }) {
  return (
    <div className="flex gap-3">
      {['True', 'False'].map((opt) => (
        <button
          key={opt}
          onClick={() => onAnswer(opt)}
          className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
            answer === opt
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-200'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/8'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function EssayQuestion({ answer, onAnswer }: { answer: string; onAnswer: (a: string) => void }) {
  return (
    <textarea
      value={answer}
      onChange={(e) => onAnswer(e.target.value)}
      placeholder="Write your answer here..."
      rows={6}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm resize-none transition-all"
    />
  );
}

function CodingQuestion({ answer, onAnswer }: { answer: string; onAnswer: (a: string) => void }) {
  return (
    <textarea
      value={answer}
      onChange={(e) => onAnswer(e.target.value)}
      placeholder="// Write your code here..."
      rows={10}
      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-emerald-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm resize-none font-mono transition-all"
    />
  );
}

export default function TestTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const { data: test, isLoading, error } = useQuery({
    queryKey: ['test', id],
    queryFn: () => testService.getById(id),
  });

  useEffect(() => {
    if (test && started) {
      setTimeLeft(test.duration * 60);
      setStartTime(Date.now());
    }
  }, [test, started]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  const submitMutation = useMutation({
    mutationFn: (data: { answers: AnswerEntry[]; timeTaken: number }) =>
      testService.submit(id, data.answers, data.timeTaken),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      toast.success(`Test submitted! Score: ${result.percentage.toFixed(1)}%`);
      router.push('/results');
    },
    onError: () => toast.error('Failed to submit test'),
  });

  const handleSubmit = useCallback(() => {
    if (!test) return;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answerList: AnswerEntry[] = test.questions.map((q) => ({
      question: q._id,
      answer: answers[q._id] ?? '',
      marksAwarded: 0,
    }));
    submitMutation.mutate({ answers: answerList, timeTaken });
  }, [test, answers, startTime, submitMutation]);

  useEffect(() => {
    if (started && timeLeft === 0 && test) handleSubmit();
  }, [started, timeLeft, test, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (error || !test) return <ErrorMessage message="Failed to load test" />;

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-2xl w-fit mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{test.title}</h1>
          <p className="text-gray-400 mb-6">{test.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Questions', value: test.questions.length },
              { label: 'Duration', value: `${test.duration} min` },
              { label: 'Total Marks', value: test.totalMarks },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStarted(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-8 py-3 font-medium transition-all duration-300"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  const currentQ: TestQuestion = test.questions[currentIdx];
  const answered = Object.keys(answers).length;
  const progress = (answered / test.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">{test.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Question {currentIdx + 1} of {test.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono font-bold ${
          timeLeft < 300 ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
        }`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wide">
            {currentQ.type.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">{currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}</span>
        </div>

        <p className="text-white font-medium mb-6 leading-relaxed">{currentQ.question}</p>

        {currentQ.type === 'mcq' && (
          <MCQQuestion
            question={currentQ}
            answer={answers[currentQ._id] ?? ''}
            onAnswer={(a) => setAnswers({ ...answers, [currentQ._id]: a })}
          />
        )}
        {currentQ.type === 'true_false' && (
          <TrueFalseQuestion
            answer={answers[currentQ._id] ?? ''}
            onAnswer={(a) => setAnswers({ ...answers, [currentQ._id]: a })}
          />
        )}
        {currentQ.type === 'essay' && (
          <EssayQuestion
            answer={answers[currentQ._id] ?? ''}
            onAnswer={(a) => setAnswers({ ...answers, [currentQ._id]: a })}
          />
        )}
        {currentQ.type === 'coding' && (
          <CodingQuestion
            answer={answers[currentQ._id] ?? ''}
            onAnswer={(a) => setAnswers({ ...answers, [currentQ._id]: a })}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-sm disabled:opacity-30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-1.5">
          {test.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                i === currentIdx
                  ? 'bg-purple-600 text-white'
                  : answers[test.questions[i]._id]
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx < test.questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(Math.min(test.questions.length - 1, currentIdx + 1))}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit Test'}
          </button>
        )}
      </div>
    </div>
  );
}
