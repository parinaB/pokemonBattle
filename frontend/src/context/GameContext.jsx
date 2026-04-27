import { createContext, useCallback, useContext, useMemo, useState } from "react";
/* eslint-disable react-refresh/only-export-components */

const GameContext = createContext(null);

const defaultState = {
  mode: null,
  player1Team: [],
  player2Team: [],
  customImages: {},
  roundResults: [],
  finalWinner: null,
  themeColor: "#7c3aed",
};

export function GameProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const setMode = useCallback((mode) => setState((s) => ({ ...s, mode })), []);
  const setTeams = useCallback(
    (player1Team, player2Team) => setState((s) => ({ ...s, player1Team, player2Team })),
    []
  );
  const setCustomImage = useCallback(
    (pokemonId, imageUrl) =>
      setState((s) => ({ ...s, customImages: { ...s.customImages, [pokemonId]: imageUrl } })),
    []
  );
  const setBattleOutcome = useCallback(
    (roundResults, finalWinner) => setState((s) => ({ ...s, roundResults, finalWinner })),
    []
  );
  const setThemeColor = useCallback(
    (themeColor) => setState((s) => (s.themeColor === themeColor ? s : { ...s, themeColor })),
    []
  );
  const resetGame = useCallback(() => setState(defaultState), []);

  const value = useMemo(
    () => ({
      state,
      setMode,
      setTeams,
      setCustomImage,
      setBattleOutcome,
      setThemeColor,
      resetGame,
    }),
    [resetGame, setBattleOutcome, setCustomImage, setMode, setTeams, setThemeColor, state]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
