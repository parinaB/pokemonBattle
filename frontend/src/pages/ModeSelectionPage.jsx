import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ModeCard from "../components/ModeCard";
import GlassCard from "../components/GlassCard";
import { useGame } from "../context/GameContext";

export default function ModeSelectionPage() {
  const navigate = useNavigate();
  const { setMode } = useGame();

  const selectMode = (mode) => {
    setMode(mode);
    navigate("/select");
  };

  return (
    <GlassCard className="w-full max-w-5xl">
      <motion.h2 className="text-center text-4xl font-bold">Choose Your Battle Mode</motion.h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <ModeCard title="1v1 Battle" subtitle="Single duel with instant ML prediction" onClick={() => selectMode("1v1")} />
        <ModeCard title="6v6 Battle" subtitle="Sequential team battles with score tracking" onClick={() => selectMode("6v6")} />
      </div>
    </GlassCard>
  );
}
