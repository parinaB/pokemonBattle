import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { useMemo } from "react";
import LandingPage from "./pages/LandingPage";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import PokemonSelectionPage from "./pages/PokemonSelectionPage";
import BattlePage from "./pages/BattlePage";
import WinnerPage from "./pages/WinnerPage";
import FloatingPokemonBg from "./components/FloatingPokemonBg";
import { useGame } from "./context/GameContext";

function PageShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { state } = useGame();
  const pokemonPool = useMemo(
    () => [...state.player1Team, ...state.player2Team],
    [state.player1Team, state.player2Team]
  );

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden text-slate-100"
      animate={{
        background: `radial-gradient(circle at 25% 20%, ${state.themeColor}55 0%, #020617 58%, #01030b 100%)`,
      }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-20 top-0 h-80 w-80 rounded-full blur-3xl"
          animate={{ backgroundColor: `${state.themeColor}66` }}
          transition={{ duration: 1.4 }}
        />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <FloatingPokemonBg pokemonPool={pokemonPool} customImages={state.customImages} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageShell><LandingPage /></PageShell>} />
          <Route path="/mode" element={<PageShell><ModeSelectionPage /></PageShell>} />
          <Route path="/select" element={<PageShell><PokemonSelectionPage /></PageShell>} />
          <Route path="/battle" element={<PageShell><BattlePage /></PageShell>} />
          <Route path="/winner" element={<PageShell><WinnerPage /></PageShell>} />
        </Routes>
      </AnimatePresence>
    </motion.div>
  );
}
