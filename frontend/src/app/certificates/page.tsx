'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Download, ExternalLink, Calendar, Hash, Star } from 'lucide-react';
import Link from 'next/link';
import { certificateService } from '@/services/certificate.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function CertificateCard({ cert }: { cert: any }) {
  const formatDate = (d: any) => {
    if (!d) return null;
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return null; }
  };

  const certId = cert.id || cert._id;
  const issuedDate = formatDate(cert.issuedAt || cert.createdAt);

  return (
    <div className="cert-card glass-card hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
      {/* Header gradient band */}
      <div className="h-24 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 dots-bg opacity-30" />
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
          <Award className="w-7 h-7 text-amber-400" />
        </div>
        {/* Shine effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-base leading-tight mb-1 line-clamp-1 group-hover:text-amber-400 transition-colors">
          {cert.title || 'Certificate'}
        </h3>
        <p className="text-xs text-gray-500 mb-4">Issued by {cert.issuedBy || 'Cosmic SaaS'}</p>

        <div className="space-y-1.5 mb-4">
          {issuedDate && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
              <span>Issued {issuedDate}</span>
            </div>
          )}
          {cert.certificateId && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Hash className="w-3.5 h-3.5 text-gray-700" />
              <span className="font-mono truncate">{cert.certificateId}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {cert.certificateUrl ? (
            <>
              <a
                href={cert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:shadow-lg hover:shadow-amber-500/25"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              {certId && (
                <Link
                  href={`/certificates/${certId}`}
                  className="p-2 text-gray-500 hover:text-white rounded-xl hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all"
                  title="View Certificate"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-500 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-500/50" />
              Certificate earned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateService.getAll(),
  });

  const data = Array.isArray(rawData) ? rawData : [];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Certificates</h1>
            <p className="text-gray-400 text-sm">Your earned achievements and credentials</p>
          </div>
          {data.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">{data.length} earned</span>
            </div>
          )}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load certificates" onRetry={refetch} />}

      {!isLoading && !error && (
        data.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-amber-400/50" />
            </div>
            <p className="text-gray-400 font-medium">No certificates yet</p>
            <p className="text-sm text-gray-600 mt-1">Complete tests and hackathons to earn certificates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {data.map((cert: any, index: number) => (
              <CertificateCard key={cert.id || cert._id || `cert-${index}`} cert={cert} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
