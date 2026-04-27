import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import GlassCard from "../components/GlassCard";

export default function WinnerPage() {
  const navigate = useNavigate();
  const { state, resetGame, setThemeColor } = useGame();
  const isTie = state.finalWinner === "TIE";
  const isSixVsSix = state.mode === "6v6";
  const winnerPlayer = isTie ? "Tie" : state.finalWinner === "P2" ? "Player 2" : "Player 1";
  const winningTeam = isTie ? [] : state.finalWinner === "P2" ? state.player2Team : state.player1Team;
  const championPokemon = winningTeam[0];
  const winningTeamName = isTie ? "Both teams are equal" : `${winnerPlayer} Team`;

  useEffect(() => {
    if (championPokemon?.color) setThemeColor(championPokemon.color);
  }, [championPokemon, setThemeColor]);

  return (
    <GlassCard className="w-full max-w-4xl">
      <div className="rounded-3xl border border-emerald-300/35 bg-emerald-500/10 p-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-200/90">
          {isTie ? "Battle Result" : "Winning Team"}
        </p>
        <h2 className="mt-2 text-center text-3xl font-bold text-white">
          {isTie
            ? "Its a tie!"
            : isSixVsSix
              ? `${winnerPlayer} wins the 6v6 battle`
              : `${winnerPlayer} wins with ${championPokemon?.name ?? "Champion Pokemon"}`}
        </h2>
        <p className="mt-2 text-center text-lg text-emerald-100">{winningTeamName}</p>
        {!isSixVsSix && championPokemon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="mt-5 flex flex-col items-center justify-center"
          >
            <img
              src={state.customImages[championPokemon.id] ?? championPokemon.image}
              alt={championPokemon.name}
              className="h-48 w-48 object-contain drop-shadow-[0_0_36px_rgba(16,185,129,0.6)]"
            />
            <p className="mt-2 text-xl font-semibold text-emerald-100">{championPokemon.name}</p>
          </motion.div>
        ) : null}
      </div>
      <div className="mt-6 rounded-2xl border border-white/15 p-4 text-sm text-slate-300">
        {state.roundResults.map((round) => (
          <p key={round.round}>
            Round {round.round}: {round.p1.name} vs {round.p2.name} {"->"} {round.winner}
          </p>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          resetGame();
          navigate("/");
        }}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-4 font-bold text-slate-950"
      >
        Play Again
      </motion.button>
    </GlassCard>
  );
}
