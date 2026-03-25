'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Download, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { certificateService } from '@/services/certificate.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Certificate } from '@/types';

function CertificateCard({ cert }: { cert: Certificate }) {
  const handleDownload = async () => {
    try {
      const blob = await certificateService.download(cert._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download certificate');
    }
  };

  const typeColors: Record<string, string> = {
    test: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    hackathon: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    course: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 rounded-xl">
          <Award className="w-6 h-6 text-amber-400" />
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${typeColors[cert.type] ?? typeColors.test}`}>
          {cert.type}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">{cert.title}</h3>
      <p className="text-sm text-gray-400 mb-4">{cert.issuedFor}</p>

      <div className="space-y-2 mb-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          Issued: {new Date(cert.issueDate).toLocaleDateString()}
        </div>
        {cert.score !== undefined && (
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Score: {cert.score}%
          </div>
        )}
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-emerald-400/80">{cert.verificationCode}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
      >
        <Download className="w-4 h-4" /> Download PDF
      </button>
    </div>
  );
}

export default function CertificatesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificateService.getAll,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Certificates</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your earned certificates and achievements</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load certificates" onRetry={refetch} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No certificates yet. Complete tests and hackathons to earn them!</p>
            </div>
          ) : (
            data.map((cert) => <CertificateCard key={cert._id} cert={cert} />)
          )}
        </div>
      )}
    </div>
  );
}
