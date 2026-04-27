import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import BattlePokemonPanel from "../components/BattlePokemonPanel";
import GlassCard from "../components/GlassCard";
import { checkBackendHealth, predictWinner } from "../utils/api";

async function runBattle(mode, team1, team2) {
  const rounds = mode === "6v6" ? 6 : 1;
  const results = [];

  for (let i = 0; i < rounds; i += 1) {
    const response = await predictWinner(team1[i], team2[i]);
    const rawWinner = String(response?.winner ?? "").trim().toUpperCase();
    if (rawWinner !== "P1" && rawWinner !== "P2") {
      throw new Error(`Model returned unsupported winner label: ${response?.winner}`);
    }
    const winner = rawWinner;
    results.push({
      round: i + 1,
      winner,
      p1: team1[i],
      p2: team2[i],
      model: {
        confidence: response?.confidence,
        p1Probability: response?.p1_probability,
        p2Probability: response?.p2_probability,
        decodedLabel: response?.decoded_label,
      },
    });
  }

  const p1Wins = results.filter((r) => r.winner === "P1").length;
  const p2Wins = results.length - p1Wins;
  const finalWinner = p1Wins === p2Wins ? "TIE" : p1Wins > p2Wins ? "P1" : "P2";

  return { results, finalWinner, p1Wins, p2Wins };
}

export default function BattlePage() {
  const navigate = useNavigate();
  const { state, setBattleOutcome, setThemeColor } = useGame();
  const [loading, setLoading] = useState(true);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [statusText, setStatusText] = useState("Connecting to model backend...");
  const [backendError, setBackendError] = useState("");
  const [battleResults, setBattleResults] = useState([]);
  const [isRevealingWinner, setIsRevealingWinner] = useState(false);
  const isSixVsSix = state.mode === "6v6";
  const REVEAL_DELAY_MS = 1600;

  useEffect(() => {
    let mounted = true;

    const play = async () => {
      try {
        setBackendError("");
        setStatusText("Checking backend health...");
        await checkBackendHealth();
        if (!mounted) return;
        setStatusText("Backend connected. Running model predictions...");
        const data = await runBattle(state.mode, state.player1Team, state.player2Team);
        if (!mounted) return;
        setBattleResults(data.results);
        setBattleOutcome(data.results, data.finalWinner);
        setRoundIndex(0);
        setScore({ p1: 0, p2: 0 });
        setStatusText("Round 1: Battle in progress... analyzing powers");
        setIsRevealingWinner(true);
        setTimeout(() => {
          if (!mounted) return;
          setScore({
            p1: data.results[0]?.winner === "P1" ? 1 : 0,
            p2: data.results[0]?.winner === "P2" ? 1 : 0,
          });
          setStatusText(
            `Round 1 result: ${data.results[0]?.winner ?? "P1"} wins this matchup`
          );
          setIsRevealingWinner(false);
        }, REVEAL_DELAY_MS);

        setLoading(false);
        if (!isSixVsSix) {
          setTimeout(() => navigate("/winner"), REVEAL_DELAY_MS + 1700);
        }
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setBackendError(
          `Backend/model is not connected: ${error?.message || "start backend server and try again."}`
        );
        setStatusText("Battle could not start.");
        setLoading(false);
      }
    };

    play();
    return () => {
      mounted = false;
    };
  }, [isSixVsSix, navigate, setBattleOutcome, state.mode, state.player1Team, state.player2Team]);

  const currentRound = useMemo(() => {
    return {
      p1: state.player1Team[roundIndex],
      p2: state.player2Team[roundIndex],
    };
  }, [roundIndex, state.player1Team, state.player2Team]);
  const currentResult = battleResults[roundIndex];
  const winningPokemon =
    currentResult?.winner === "P1" ? currentResult?.p1 : currentResult?.winner === "P2" ? currentResult?.p2 : null;
  const hasNextRound = roundIndex < battleResults.length - 1;

  const goNextRound = () => {
    if (!hasNextRound) {
      navigate("/winner");
      return;
    }
    const nextIndex = roundIndex + 1;
    const nextResult = battleResults[nextIndex];
    setRoundIndex(nextIndex);
    setIsRevealingWinner(true);
    setStatusText(`Round ${nextIndex + 1}: Battle in progress... analyzing powers`);
    setTimeout(() => {
      setScore({
        p1: battleResults
          .slice(0, nextIndex + 1)
          .filter((r) => r.winner === "P1").length,
        p2: battleResults
          .slice(0, nextIndex + 1)
          .filter((r) => r.winner === "P2").length,
      });
      setStatusText(`Round ${nextIndex + 1} result: ${nextResult.winner} wins this matchup`);
      setIsRevealingWinner(false);
    }, REVEAL_DELAY_MS);
  };

  useEffect(() => {
    if (!currentRound.p1) return;
    setThemeColor(currentRound.p1.color);
  }, [currentRound.p1, setThemeColor]);

  if (!currentRound.p1 || !currentRound.p2) {
    return <GlassCard className="text-center">Select teams first.</GlassCard>;
  }

  return (
    <GlassCard className="w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Battle Arena</h2>
        <div className="rounded-xl border border-white/20 px-4 py-2 text-sm">Score: P1 {score.p1} - {score.p2} P2</div>
      </div>

      {loading ? (
        <p className="text-center text-slate-300">{statusText}</p>
      ) : (
        <div className="grid items-center gap-4 md:grid-cols-2">
          <BattlePokemonPanel
            pokemon={currentRound.p1}
            imageUrl={state.customImages[currentRound.p1.id]}
            side="left"
            status={
              isRevealingWinner
                ? "neutral"
                : currentResult?.winner === "P1"
                  ? "winner"
                  : currentResult?.winner === "P2"
                    ? "loser"
                    : "neutral"
            }
          />
          <BattlePokemonPanel
            pokemon={currentRound.p2}
            imageUrl={state.customImages[currentRound.p2.id]}
            side="right"
            status={
              isRevealingWinner
                ? "neutral"
                : currentResult?.winner === "P2"
                  ? "winner"
                  : currentResult?.winner === "P1"
                    ? "loser"
                    : "neutral"
            }
          />
        </div>
      )}

      {!loading && winningPokemon && !isRevealingWinner ? (
        <motion.div
          key={`winner-${roundIndex}-${winningPokemon.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-emerald-300/35 bg-emerald-400/10 p-3"
        >
          <img
            src={state.customImages[winningPokemon.id] ?? winningPokemon.image}
            alt={winningPokemon.name}
            className="h-14 w-14 rounded-xl object-contain"
          />
          <p className="text-base font-semibold text-emerald-100">
            Winner: {winningPokemon.name} ({currentResult.winner})
          </p>
          <p className="text-xs text-emerald-200/90">
            Model: P1 {Math.round((currentResult.model?.p1Probability ?? 0) * 100)}% | P2{" "}
            {Math.round((currentResult.model?.p2Probability ?? 0) * 100)}%
          </p>
        </motion.div>
      ) : null}

      {!loading && !backendError && isSixVsSix ? (
        <div className="mt-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={goNextRound}
            disabled={isRevealingWinner}
            className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-3 font-semibold text-slate-950"
          >
            {isRevealingWinner
              ? "Revealing winner..."
              : hasNextRound
                ? "Next Battle"
                : "Show Final Winner"}
          </motion.button>
        </div>
      ) : null}

      {backendError ? (
        <p className="mt-6 rounded-xl border border-rose-300/40 bg-rose-400/10 p-3 text-center text-sm text-rose-200">
          {backendError}
        </p>
      ) : (
        <motion.p
          key={roundIndex + statusText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-lg text-slate-200"
        >
          {statusText}
        </motion.p>
      )}
    </GlassCard>
  );
}
