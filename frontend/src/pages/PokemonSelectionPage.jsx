import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { pokemonDataset } from "../data/pokemonData";
import SwipeCarousel from "../components/SwipeCarousel";
import GlassCard from "../components/GlassCard";

export default function PokemonSelectionPage() {
  const navigate = useNavigate();
  const { state, setTeams, setThemeColor } = useGame();
  const teamSize = state.mode === "6v6" ? 6 : 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [player1, setPlayer1] = useState([]);
  const [player2, setPlayer2] = useState([]);

  const activePokemon = useMemo(() => pokemonDataset[activeIndex], [activeIndex]);

  useEffect(() => {
    setThemeColor(activePokemon.color);
  }, [activePokemon.color, setThemeColor]);

  const addToTeam = (player) => {
    const updater = player === 1 ? setPlayer1 : setPlayer2;
    updater((prev) => {
      if (prev.length >= teamSize) return prev;
      if (prev.some((item) => item.id === activePokemon.id)) return prev;
      return [...prev, activePokemon];
    });
  };

  const ready = player1.length === teamSize && player2.length === teamSize;

  return (
    <GlassCard className="w-full max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Select Pokemon ({state.mode})</h2>
        <p className="text-sm text-slate-300">Swipe cards to browse</p>
      </div>

      <div className="mt-6">
        <SwipeCarousel
          pokemons={pokemonDataset}
          activeIndex={activeIndex}
          onChange={setActiveIndex}
          customImages={state.customImages}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => addToTeam(1)} className="rounded-2xl border border-fuchsia-300/40 bg-fuchsia-400/10 p-4">
          Add to Player 1 ({player1.length}/{teamSize})
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => addToTeam(2)} className="rounded-2xl border border-cyan-300/40 bg-cyan-400/10 p-4">
          Add to Player 2 ({player2.length}/{teamSize})
        </motion.button>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
        <div className="rounded-2xl border border-white/15 p-4">P1: {player1.map((p) => p.name).join(", ") || "None"}</div>
        <div className="rounded-2xl border border-white/15 p-4">P2: {player2.map((p) => p.name).join(", ") || "None"}</div>
      </div>

      <motion.button
        disabled={!ready}
        whileHover={ready ? { scale: 1.02 } : undefined}
        onClick={() => {
          setTeams(player1, player2);
          navigate("/battle");
        }}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Begin Battle
      </motion.button>
    </GlassCard>
  );
}
