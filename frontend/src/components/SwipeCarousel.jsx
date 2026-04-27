import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PokemonCard from "./PokemonCard";

export default function SwipeCarousel({ pokemons, activeIndex, onChange, customImages }) {
  const prevIndex = (activeIndex - 1 + pokemons.length) % pokemons.length;
  const nextIndex = (activeIndex + 1) % pokemons.length;
  const activePokemon = pokemons[activeIndex];

  return (
    <motion.div
      key={activePokemon.id}
      initial={{ background: "radial-gradient(circle, #111827 0%, #020617 75%)" }}
      animate={{ background: `radial-gradient(circle, ${activePokemon.color}33 0%, #020617 75%)` }}
      transition={{ duration: 0.7 }}
      className="w-full rounded-[2rem] border border-white/10 p-8"
    >
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <button onClick={() => onChange(prevIndex)} className="rounded-full border border-white/25 p-3 text-slate-200 transition hover:bg-white/10">
          <ChevronLeft />
        </button>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) onChange(nextIndex);
            if (info.offset.x > 70) onChange(prevIndex);
          }}
          className="flex items-center gap-3 md:gap-6"
        >
          <PokemonCard pokemon={pokemons[prevIndex]} isActive={false} imageUrl={customImages[pokemons[prevIndex].id]} />
          <PokemonCard pokemon={activePokemon} isActive imageUrl={customImages[activePokemon.id]} />
          <PokemonCard pokemon={pokemons[nextIndex]} isActive={false} imageUrl={customImages[pokemons[nextIndex].id]} />
        </motion.div>

        <button onClick={() => onChange(nextIndex)} className="rounded-full border border-white/25 p-3 text-slate-200 transition hover:bg-white/10">
          <ChevronRight />
        </button>
      </div>
    </motion.div>
  );
}
