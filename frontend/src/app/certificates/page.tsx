'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import { certificateService } from '@/services/certificate.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function CertificateCard({ cert }: { cert: any }) {
  // Safe date formatting
  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const certId = cert.id || cert._id;
  const issuedDate = formatDate(cert.issuedAt || cert.createdAt || new Date());

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{cert.title || 'Certificate'}</h3>
          <p className="text-sm text-gray-400 mt-1">
            Issued by {cert.issuedBy || 'Cosmic SaaS'}
          </p>
        </div>
        <Award className="w-8 h-8 text-amber-400" />
      </div>

      <div className="space-y-2 text-sm text-gray-400 mb-4">
        <p>
          Issued on:{' '}
          <span className="text-white font-medium">{issuedDate}</span>
        </p>
        {cert.expiresAt && (
          <p>
            Expires on:{' '}
            <span className="text-white font-medium">
              {formatDate(cert.expiresAt)}
            </span>
          </p>
        )}
        {cert.certificateId && (
          <p>
            Certificate ID:{' '}
            <span className="text-white font-mono text-xs">{cert.certificateId}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {cert.certificateUrl ? (
          <>
            <a
              href={cert.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            {certId && (
              <Link
                href={`/certificates/${certId}`}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                title="View Details"
              >
                <Share2 className="w-4 h-4" />
              </Link>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-2 bg-white/5 rounded-lg text-gray-400 text-sm">
            Certificate generated
          </div>
        )}
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
      <div>
        <h2 className="text-2xl font-bold text-white">Certificates</h2>
        <p className="text-sm text-gray-400 mt-0.5">View and share your achievements</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load certificates" onRetry={refetch} />}

      {!isLoading && !error && (
        <div>
          {data.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No certificates yet. Complete tests to earn certificates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((cert: any, index: number) => (
                <CertificateCard 
                  key={cert.id || cert._id || `cert-${index}`} 
                  cert={cert} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
