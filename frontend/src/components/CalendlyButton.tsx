'use client';

export default function CalendlyButton({ className }: { className?: string }) {
  const openCalendly = () => {
    const url = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/your-link';
    window.open(url, '_blank');
  };
  return (
    <button onClick={openCalendly} className={className}>
      📅 Book a Demo Call
    </button>
  );
}
