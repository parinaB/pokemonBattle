import { motion } from "framer-motion";

const confetti = Array.from({ length: 36 }, (_, i) => i);

export default function WinnerCelebration({ winner }) {
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-black/40 p-10 text-center">
      {confetti.map((item) => (
        <motion.span
          key={item}
          className="absolute h-3 w-3 rounded-full"
          style={{
            background: item % 2 === 0 ? "#f472b6" : "#22d3ee",
            left: `${(item / confetti.length) * 100}%`,
            top: "-5%",
          }}
          animate={{ y: [0, 420], rotate: [0, 280], opacity: [1, 1, 0.1] }}
          transition={{ duration: 2 + (item % 5) * 0.2, repeat: Infinity, delay: item * 0.04 }}
        />
      ))}

      <motion.h2
        animate={{ scale: [1, 1.08, 1], rotate: [0, -1, 1, 0] }}
        transition={{ duration: 1.1, repeat: Infinity }}
        className="text-5xl font-black text-white"
      >
        {winner} Wins!
      </motion.h2>
      <motion.div
        animate={{ boxShadow: ["0 0 30px #22d3ee66", "0 0 85px #f472b666", "0 0 30px #22d3ee66"] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="mt-4 rounded-full border border-white/30 px-5 py-2 text-slate-200"
      >
        Battle Complete
      </motion.div>
    </div>
  );
}
