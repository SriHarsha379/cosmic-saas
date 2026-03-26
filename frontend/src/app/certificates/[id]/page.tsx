'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Share2, Award } from 'lucide-react';
import Link from 'next/link';
import { certificateService } from '@/services/certificate.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const certId = unwrappedParams?.id;

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ['certificate', certId],
    queryFn: () => certificateService.getById(certId!),
    enabled: !!certId,
    retry: false,
  });

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

  if (!certId) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href="/certificates" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold text-white">Certificate Not Found</h2>
        </div>
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">The certificate you're looking for doesn't exist</p>
          <Link
            href="/certificates"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
          >
            Back to Certificates
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (!cert) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Certificate not found</p>
        <Link href="/certificates" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/certificates" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-white">Certificate Details</h2>
      </div>

      {/* Certificate Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{cert.title || 'Certificate'}</h1>
            <p className="text-gray-400 mt-2">Issued by {cert.issuedBy || 'Cosmic SaaS'}</p>
          </div>
          <Award className="w-12 h-12 text-amber-400" />
        </div>

        {/* Certificate Preview */}
        {cert.certificateUrl && (
          <div className="mb-6">
            <img
              src={cert.certificateUrl}
              alt={cert.title}
              className="w-full rounded-lg border border-white/10"
            />
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Issued On</label>
            <p className="text-lg font-semibold text-white">
              {formatDate(cert.issuedAt || cert.createdAt)}
            </p>
          </div>
          {cert.expiresAt && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Expires On</label>
              <p className="text-lg font-semibold text-white">
                {formatDate(cert.expiresAt)}
              </p>
            </div>
          )}
        </div>

        {cert.certificateId && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Certificate ID</label>
            <p className="text-sm font-mono text-white bg-white/5 p-3 rounded-lg">
              {cert.certificateId}
            </p>
          </div>
        )}

        {cert.description && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <p className="text-gray-300">{cert.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {cert.certificateUrl && (
            <>
              <a
                href={cert.certificateUrl}
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-all"
              >
                <Download className="w-5 h-5" />
                Download Certificate
              </a>
              <button className="flex items-center justify-center gap-2 px-6 py-3 border border-white/10 hover:bg-white/5 text-white rounded-lg transition-all">
                <Share2 className="w-5 h-5" />
                Share Certificate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div>
        <Link
          href="/certificates"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          ← Back to Certificates
        </Link>
      </div>
    </div>
  );
}
