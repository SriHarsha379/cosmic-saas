'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AnswerEntry {
  question: string;
  answer: string;
  marksAwarded: number;
}

function QuestionDisplay({ question, answer, onAnswer }: { question: any; answer: string; onAnswer: (a: string) => void }) {
  // The field name is "question", not "text"
  const questionContent = question.question || question.text || question.content || question.description || 'No question text';
  
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <p className="text-white leading-relaxed whitespace-pre-wrap text-base">{questionContent}</p>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {(question.type === 'MCQ' || question.type === 'MULTIPLE_CHOICE') && (
          <>
            {question.options?.map((opt: string, i: number) => (
              <label key={i} className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={answer === opt}
                  onChange={(e) => onAnswer(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-300">{opt}</span>
              </label>
            ))}
          </>
        )}

        {question.type === 'TRUE_FALSE' && (
          <div className="flex gap-3">
            {['true', 'false'].map((opt) => (
              <button
                key={opt}
                onClick={() => onAnswer(opt)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  answer === opt
                    ? 'bg-purple-600 text-white border border-purple-500'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {opt === 'true' ? '✓ True' : '✗ False'}
              </button>
            ))}
          </div>
        )}

        {question.type === 'ESSAY' && (
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm resize-none transition-all"
          />
        )}

        {question.type === 'CODING' && (
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Write your code:</label>
            <textarea
              value={answer}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="// Write your code here..."
              rows={10}
              className="w-full bg-black/30 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm resize-none font-mono transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const qc = useQueryClient();
  
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { data: test, isLoading, error } = useQuery({
    queryKey: ['test', id],
    queryFn: () => testService.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (test && started && timeLeft === null) {
      setTimeLeft(test.duration * 60);
      setStartTime(Date.now());
    }
  }, [test, started, timeLeft]);

  useEffect(() => {
    if (!started || timeLeft === null || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((t) => (t && t > 0 ? t - 1 : 0));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  const submitMutation = useMutation({
    mutationFn: (data: { answers: AnswerEntry[]; timeTaken: number }) =>
      testService.submit(id!, data.answers, data.timeTaken),
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      const score = result.accuracy?.toFixed(1) || result.score || 0;
      toast.success(`✅ Test submitted! Score: ${score}%`);
      router.push('/dashboard');
    },
    onError: (err: any) => {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to submit test');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!test?.questions || submitMutation.isPending) return;
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const answerList: AnswerEntry[] = test.questions.map((q: any) => ({
      question: q.id || q._id,
      answer: answers[q.id || q._id] ?? '',
      marksAwarded: 0,
    }));
    submitMutation.mutate({ answers: answerList, timeTaken });
  }, [test, answers, startTime, submitMutation]);

  useEffect(() => {
    if (started && timeLeft === 0 && !submitMutation.isPending && test) {
      handleSubmit();
    }
  }, [started, timeLeft, test, submitMutation.isPending, handleSubmit]);

  if (!id) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-400">Failed to load test</div>;
  if (!test) return <div className="text-center py-12 text-gray-400">Test not found</div>;

  const currentQuestion = test.questions?.[currentIdx];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const progress = ((currentIdx + 1) / (test.questions?.length || 1)) * 100;

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{test.title}</h1>
          <p className="text-gray-400 mb-6">{test.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-400">{test.questions?.length || 0}</p>
              <p className="text-sm text-gray-400">Questions</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-400">{test.duration}</p>
              <p className="text-sm text-gray-400">Minutes</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-2xl font-bold text-emerald-400">{test.totalScore || 100}</p>
              <p className="text-sm text-gray-400">Total Score</p>
            </div>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="font-bold text-white">{test.title}</h2>
        <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft !== null && timeLeft < 300 ? 'text-red-400' : 'text-amber-400'}`}>
          <Clock className="w-4 h-4" />
          <span>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-white/5 border border-white/10 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Question {currentIdx + 1} of {test.questions?.length}</p>
            <span className="text-xs px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full">
              {currentQuestion.type === 'MCQ' ? 'Multiple Choice' : currentQuestion.type || 'Question'}
            </span>
          </div>

          <QuestionDisplay
            question={currentQuestion}
            answer={answers[currentQuestion.id || currentQuestion._id] ?? ''}
            onAnswer={(a) => setAnswers({ ...answers, [currentQuestion.id || currentQuestion._id]: a })}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex-1" />
        {currentIdx === (test.questions?.length || 0) - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 rounded-lg text-white font-medium disabled:opacity-50 transition-all"
          >
            <CheckCircle className="w-4 h-4" /> {submitMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(Math.min((test.questions?.length || 1) - 1, currentIdx + 1))}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
