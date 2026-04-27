import { motion } from "framer-motion";
import { pokemonDataset } from "../data/pokemonData";

const slots = [
  { top: "8%", left: "6%", size: 80, duration: 7.5 },
  { top: "20%", left: "84%", size: 100, duration: 8.6 },
  { top: "66%", left: "10%", size: 90, duration: 9.2 },
  { top: "74%", left: "79%", size: 110, duration: 10.1 },
  { top: "45%", left: "48%", size: 70, duration: 7.8 },
];

export default function FloatingPokemonBg({ pokemonPool, customImages }) {
  const source = pokemonPool?.length ? pokemonPool : pokemonDataset.slice(0, 5);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {slots.map((slot, index) => {
        const pokemon = source[index % source.length];
        const imageUrl = customImages[pokemon.id] ?? pokemon.image;
        return (
          <motion.img
            key={`${pokemon.id}-${index}`}
            src={imageUrl}
            alt=""
            className="absolute select-none opacity-15 grayscale"
            style={{
              top: slot.top,
              left: slot.left,
              width: slot.size,
              height: slot.size,
              filter: "drop-shadow(0 0 16px rgba(255,255,255,0.2))",
            }}
            animate={{ y: [0, -18, 0], x: [0, 8, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: slot.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}
