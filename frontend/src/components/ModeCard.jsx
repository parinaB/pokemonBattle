import { motion } from "framer-motion";

export default function ModeCard({ title, subtitle, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(56, 189, 248, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group w-full rounded-3xl border border-white/15 bg-slate-900/60 p-10 text-left backdrop-blur-xl"
    >
      <h3 className="text-3xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-slate-300">{subtitle}</p>
      <div className="mt-8 h-1 w-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 transition-all duration-500 group-hover:w-full" />
    </motion.button>
  );
}
