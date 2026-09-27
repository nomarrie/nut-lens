const normalize = (value) => value.trim().toLocaleLowerCase("id-ID");

const ingredientButtons = [...document.querySelectorAll("[data-ingredient]")];
const selectedContainer = document.querySelector("[data-selected-ingredients]");
const recipeCards = [...document.querySelectorAll("[data-recipe-ingredients]")];
const recipeRecommendations = document.querySelector(".recipe-recommendations");
const recipeStatus = document.querySelector("[data-recipe-status]");
const recipeEmpty = document.querySelector("[data-recipe-empty]");
const searchInput = document.querySelector("[data-ingredient-search]");
const clearSearchButton = document.querySelector("[data-clear-ingredient-search]");
const findRecipesButton = document.querySelector("[data-find-recipes]");
const moreIngredientsButton = document.querySelector("[data-more-ingredients]");

const selectedIngredients = new Set(
  ingredientButtons
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.dataset.ingredient),
);

const getIngredientLabel = (ingredient) =>
  ingredientButtons.find((button) => button.dataset.ingredient === ingredient)?.innerText.trim() ?? ingredient;

const renderSelectedIngredients = () => {
  if (!selectedContainer) return;
  selectedContainer.replaceChildren();

  if (selectedIngredients.size === 0) {
    const empty = document.createElement("span");
    empty.textContent = "Belum ada bahan dipilih";
    selectedContainer.append(empty);
    return;
  }

  selectedIngredients.forEach((ingredient) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "ingredient-chip";
    chip.dataset.removeIngredient = ingredient;
    chip.textContent = getIngredientLabel(ingredient);
    chip.setAttribute("aria-label", `Hapus ${getIngredientLabel(ingredient)} dari pilihan`);
    selectedContainer.append(chip);
  });
};

const hideRecipeResults = () => {
  if (recipeRecommendations) recipeRecommendations.hidden = true;
  recipeCards.forEach((card) => {
    card.hidden = true;
  });
  if (recipeStatus) recipeStatus.textContent = "";
  if (recipeEmpty) recipeEmpty.hidden = true;
};

const updateRecipeResults = () => {
  const hasSelectedIngredients = selectedIngredients.size > 0;
  if (recipeRecommendations) recipeRecommendations.hidden = !hasSelectedIngredients;

  if (!hasSelectedIngredients) {
    recipeCards.forEach((card) => {
      card.hidden = true;
    });
    if (recipeStatus) recipeStatus.textContent = "";
    if (recipeEmpty) recipeEmpty.hidden = true;
    return;
  }

  let visibleCount = 0;

  recipeCards.forEach((card) => {
    const ingredients = new Set(card.dataset.recipeIngredients.split(",").map(normalize));
    const matches = [...selectedIngredients].some((ingredient) => ingredients.has(ingredient));
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  if (recipeStatus) {
    recipeStatus.textContent = visibleCount === 1
      ? "1 resep cocok dengan bahan yang dipilih"
      : `${visibleCount} resep cocok dengan bahan yang dipilih`;
  }
  if (recipeEmpty) recipeEmpty.hidden = visibleCount !== 0;
};

ingredientButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const ingredient = button.dataset.ingredient;
    const isSelected = selectedIngredients.has(ingredient);
    if (isSelected) selectedIngredients.delete(ingredient);
    else selectedIngredients.add(ingredient);
    button.setAttribute("aria-pressed", String(!isSelected));
    renderSelectedIngredients();
    hideRecipeResults();
  });
});

selectedContainer?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-remove-ingredient]");
  if (!chip) return;
  const ingredient = chip.dataset.removeIngredient;
  selectedIngredients.delete(ingredient);
  ingredientButtons.find((button) => button.dataset.ingredient === ingredient)?.setAttribute("aria-pressed", "false");
  renderSelectedIngredients();
  hideRecipeResults();
});

const updateIngredientSearch = () => {
  if (!searchInput) return;
  const query = normalize(searchInput.value);
  ingredientButtons.forEach((button) => {
    button.hidden = query.length > 0 && !normalize(button.innerText).includes(query);
  });
  if (clearSearchButton) clearSearchButton.hidden = query.length === 0;
};

searchInput?.addEventListener("input", updateIngredientSearch);

clearSearchButton?.addEventListener("click", () => {
  searchInput.value = "";
  updateIngredientSearch();
  searchInput.focus();
});

moreIngredientsButton?.addEventListener("click", () => {
  if (searchInput) searchInput.value = "";
  updateIngredientSearch();
  searchInput?.focus();
});

findRecipesButton?.addEventListener("click", () => {
  updateRecipeResults();
  if (recipeRecommendations && !recipeRecommendations.hidden) {
    recipeRecommendations.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

renderSelectedIngredients();
hideRecipeResults();
updateIngredientSearch();
