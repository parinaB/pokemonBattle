export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
