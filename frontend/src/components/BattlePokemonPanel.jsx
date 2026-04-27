import { motion } from "framer-motion";

export default function BattlePokemonPanel({ pokemon, imageUrl, side, status = "neutral" }) {
  const isWinner = status === "winner";
  const isLoser = status === "loser";

  return (
    <motion.div
      initial={{ x: side === "left" ? -160 : 160, opacity: 0 }}
      animate={{
        x: 0,
        opacity: isLoser ? 0.55 : 1,
        scale: isWinner ? 1.06 : isLoser ? 0.94 : 1,
      }}
      transition={{ type: "spring", stiffness: 85, damping: 16 }}
      className="w-full rounded-3xl border border-white/20 bg-slate-900/55 p-6"
      style={{
        boxShadow: isWinner
          ? `0 0 110px ${pokemon.color}cc`
          : `0 0 60px ${pokemon.color}55`,
      }}
    >
      <motion.img
        animate={{
          y: [0, -8, 0],
          rotate: [0, 0.8, -0.8, 0],
          scale: isWinner ? [1, 1.06, 1] : 1,
        }}
        transition={{ duration: 2.8, repeat: Infinity }}
        src={imageUrl ?? pokemon.image}
        alt={pokemon.name}
        className="mx-auto h-52 w-52 object-contain"
      />
      <h3 className="text-center text-3xl font-bold">{pokemon.name}</h3>
      <div className="mt-2 flex justify-center gap-2">
        {pokemon.type.map((type) => (
          <span key={type} className="rounded-full bg-white/10 px-3 py-1 text-xs">{type}</span>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 text-sm text-slate-200">
        <p>HP: {pokemon.stats.hp}</p>
        <p>ATK: {pokemon.stats.attack}</p>
        <p>DEF: {pokemon.stats.defense}</p>
        <p>SPD: {pokemon.stats.speed}</p>
      </div>
    </motion.div>
  );
}
