export const BRANCH_IMAGES = [
  "https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop",
];

export const getBranchImage = (branch, fallbackIndex = 0) => {
  const raw = typeof branch?.id === "number" ? branch.id : Number(branch?.id);
  const idx = Number.isFinite(raw) ? raw : fallbackIndex;
  return BRANCH_IMAGES[Math.abs(idx) % BRANCH_IMAGES.length];
};
