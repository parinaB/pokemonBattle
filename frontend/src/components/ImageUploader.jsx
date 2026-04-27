import { Upload } from "lucide-react";

export default function ImageUploader({ onUpload }) {
  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  return (
    <label className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 transition hover:scale-[1.02] hover:bg-cyan-300/20">
      <Upload size={16} />
      Upload custom artwork
      <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
    </label>
  );
}
