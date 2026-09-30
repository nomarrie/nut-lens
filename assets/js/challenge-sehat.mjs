const storageKey = "nutlens-followed-challenges";
const completeKey = "nutlens-sugar-challenge-complete";

const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The page remains functional when storage is unavailable.
  }
};

const followedChallenges = new Set(safeRead(storageKey, []));
const joinButtons = [...document.querySelectorAll(".catalog-card-join")];
const activeCount = document.querySelector("[data-active-count]");

const updateActiveCount = () => {
  if (activeCount) activeCount.textContent = `${3 + followedChallenges.size} Berlangsung`;
};

joinButtons.forEach((button) => {
  const title = button.closest(".catalog-card")?.querySelector("h3")?.textContent.trim();
  if (!title) return;

  const syncButton = () => {
    const isFollowing = followedChallenges.has(title);
    button.setAttribute("aria-pressed", String(isFollowing));
    button.textContent = isFollowing ? "Diikuti" : "Ikuti";
  };

  syncButton();
  button.addEventListener("click", () => {
    if (followedChallenges.has(title)) followedChallenges.delete(title);
    else followedChallenges.add(title);
    safeWrite(storageKey, [...followedChallenges]);
    syncButton();
    updateActiveCount();
  });
});

const completeButton = document.querySelector("[data-complete-challenge]");
const activeChallenge = completeButton?.closest("[data-active-challenge]");
const progressRing = activeChallenge?.querySelector(".active-challenge-progress-ring");

const markComplete = () => {
  if (!completeButton || !progressRing) return;
  progressRing.style.setProperty("--progress", "100%");
  progressRing.dataset.progress = "100%";
  completeButton.textContent = "Selesai Hari Ini";
  completeButton.disabled = true;
};

if (safeRead(completeKey, false)) markComplete();
completeButton?.addEventListener("click", () => {
  safeWrite(completeKey, true);
  markComplete();
});

updateActiveCount();
