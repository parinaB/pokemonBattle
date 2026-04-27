import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { pokemonDataset } from "../data/pokemonData";
import GlassCard from "../components/GlassCard";
import ImageUploader from "../components/ImageUploader";

export default function LandingPage() {
  const navigate = useNavigate();
  const { setCustomImage, setThemeColor } = useGame();
  const mascot = pokemonDataset[3];

  useEffect(() => {
    setThemeColor(mascot.color);
  }, [mascot.color, setThemeColor]);

  const uploadAll = (url) => {
    pokemonDataset.forEach((pokemon) => setCustomImage(pokemon.id, url));
  };

  return (
    <GlassCard className="w-full max-w-4xl text-center">
      <motion.img
        src={mascot.image}
        alt="Pokemon mascot"
        className="mx-auto h-52 w-52 object-contain"
        animate={{ rotate: [0, 7, -7, 0], y: [0, -7, 0] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-6 bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-indigo-200 bg-clip-text text-5xl font-bold text-transparent"
      >
        Pokemon Battle Royale
      </motion.h1>
      <p className="mx-auto mt-4 max-w-2xl text-slate-300">
        Premium animated Pokemon simulator with ML-powered battle outcomes.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4">
        <ImageUploader onUpload={uploadAll} />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/mode")}
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-8 py-4 text-lg font-semibold text-slate-950"
        >
          Start Battle
        </motion.button>
      </div>
    </GlassCard>
  );
}
