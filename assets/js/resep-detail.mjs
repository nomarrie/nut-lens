const bookmark = document.querySelector("[data-recipe-bookmark]");
const storageKey = "nutlens-bookmarked-pepes-ayam";

const getSavedState = () => {
  try {
    return localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
};

const renderBookmark = (saved) => {
  if (!bookmark) return;
  bookmark.setAttribute("aria-pressed", String(saved));
  bookmark.setAttribute("aria-label", saved ? "Hapus resep dari simpanan" : "Simpan resep");
};

renderBookmark(getSavedState());

bookmark?.addEventListener("click", () => {
  const saved = bookmark.getAttribute("aria-pressed") !== "true";
  try {
    localStorage.setItem(storageKey, String(saved));
  } catch {
    // Keep the current in-memory state when storage is unavailable.
  }
  renderBookmark(saved);
});
