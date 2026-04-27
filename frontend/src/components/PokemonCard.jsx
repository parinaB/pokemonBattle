import { motion } from "framer-motion";

export default function PokemonCard({ pokemon, isActive, imageUrl }) {
  return (
    <motion.article
      animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.65 }}
      className="relative w-[320px] rounded-3xl border border-white/20 bg-black/35 p-6 text-white backdrop-blur-xl"
      style={{ boxShadow: isActive ? `0 0 60px ${pokemon.color}66` : "0 0 0 transparent" }}
    >
      <img src={imageUrl ?? pokemon.image} alt={pokemon.name} className="mx-auto h-44 w-44 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.55)]" />
      <h4 className="mt-4 text-center text-2xl font-bold">{pokemon.name}</h4>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {pokemon.type.map((type) => (
          <span key={type} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
            {type}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-200">
        <p>HP: {pokemon.stats.hp}</p>
        <p>ATK: {pokemon.stats.attack}</p>
        <p>DEF: {pokemon.stats.defense}</p>
        <p>SPD: {pokemon.stats.speed}</p>
      </div>
    </motion.article>
  );
}
