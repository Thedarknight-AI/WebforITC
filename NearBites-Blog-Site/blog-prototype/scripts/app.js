// Homepage behavior: story browsing, filtering, pagination, and suggestions.
(() => {
  // Cache the story data and the homepage elements used by the controls.
  const { stories } = window.NearBitesJournal;
  const grid = document.querySelector("[data-story-grid]");
  const count = document.querySelector("[data-result-count]");
  const search = document.querySelector("[data-search]");
  const form = document.querySelector("[data-search-form]");
  const emptyState = document.querySelector("[data-empty-state]");
  const reset = document.querySelector("[data-reset]");
  const allStoriesButton = document.querySelector("[data-category]");
  const pagination = document.querySelector("[data-pagination]");
  const paginationPages = document.querySelector("[data-pagination-pages]");
  const previousPage = document.querySelector("[data-page-previous]");
  const nextPage = document.querySelector("[data-page-next]");
  const minimumBudget = document.querySelector("[data-budget-min]");
  const maximumBudget = document.querySelector("[data-budget-max]");
  const budgetError = document.querySelector("[data-budget-error]");
  const suggestionForm = document.querySelector("[data-suggestion-form]");
  const suggestionStatus = document.querySelector("[data-suggestion-status]");
  const featuredStory = stories[0];
  const pageSize = 6;
  let currentPage = 1;

  // Create one card containing a story's details and links.
  const createStoryCard = (story) => {
    const article = document.createElement("article");
    article.className = "story-card";
    const storyUrl = `article.html?story=${encodeURIComponent(story.slug)}`;
    article.innerHTML = `
      <a class="story-card-image" href="${storyUrl}" tabindex="-1" aria-hidden="true">
        <img src="${story.image}" alt="" loading="lazy">
        <span class="card-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="story-card-copy">
        <p class="eyebrow"><span>${story.category}</span><span class="eyebrow-divider">/</span><span>${story.location}</span></p>
        <h3><a href="${storyUrl}">${story.title}</a></h3>
        <p class="story-card-budget">Est. ₱${story.budget} per person <span>(sample)</span></p>
        <p class="story-card-summary">${story.summary}</p>
        <a class="card-read-link" href="${storyUrl}">Read the story <span aria-hidden="true">↗</span></a>
      </div>`;
    return article;
  };

  const resetFilters = () => {
    search.value = "";
    minimumBudget.value = minimumBudget.defaultValue;
    maximumBudget.value = maximumBudget.defaultValue;
    currentPage = 1;
    render();
  };

  // Filter stories by search and budget, then render the current page.
  const render = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const minBudget = Number(minimumBudget.value || 0);
    const maxBudget = Number(maximumBudget.value || 0);
    const budgetRangeIsValid = minBudget <= maxBudget;
    budgetError.hidden = budgetRangeIsValid;
    if (!budgetRangeIsValid) {
      count.textContent = "";
      grid.hidden = true;
      emptyState.hidden = true;
      pagination.hidden = true;
      paginationPages.replaceChildren();
      return;
    }

    const matchingStories = stories.filter((story) => {
      const searchableText = [story.title, story.summary, story.category, story.location].join(" ").toLocaleLowerCase();
      return searchableText.includes(query) && story.budget >= minBudget && story.budget <= maxBudget;
    });
    const pageCount = Math.ceil(matchingStories.length / pageSize);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(pageCount, 1));
    const startIndex = (currentPage - 1) * pageSize;
    const pageStories = matchingStories.slice(startIndex, startIndex + pageSize);

    grid.replaceChildren(...pageStories.map(createStoryCard));
    if (matchingStories.length === 0) {
      count.textContent = "0 stories";
    } else {
      const lastIndex = Math.min(startIndex + pageSize, matchingStories.length);
      count.textContent = `Showing ${startIndex + 1}–${lastIndex} of ${matchingStories.length} ${matchingStories.length === 1 ? "story" : "stories"}`;
    }
    grid.hidden = matchingStories.length === 0;
    emptyState.hidden = matchingStories.length !== 0;
    pagination.hidden = pageCount <= 1;
    previousPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage >= pageCount;
    paginationPages.replaceChildren(...Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      const button = document.createElement("button");
      button.className = "pagination-page";
      button.type = "button";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Page ${page}`);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => { currentPage = page; render(); });
      return button;
    }));
  };

  const refreshFromFirstPage = () => { currentPage = 1; render(); };

  // Use the first story for the featured area and its photo gallery.
  [
    ["title", featuredStory.title],
    ["summary", featuredStory.summary],
    ["category", featuredStory.category],
    ["location", featuredStory.location]
  ].forEach(([name, value]) => {
    document.querySelector(`[data-featured-${name}]`).textContent = value;
  });
  window.initPhotoGallery(document.querySelector("[data-featured-gallery]"), featuredStory.images);
  document.querySelectorAll("[data-featured-link]").forEach((link) => {
    link.href = `article.html?story=${encodeURIComponent(featuredStory.slug)}`;
  });

  // Reset the story list when the visitor chooses All stories.
  allStoriesButton.addEventListener("click", resetFilters);

  // Update results whenever either end of the budget range changes.
  [minimumBudget, maximumBudget, search].forEach((input) => {
    input.addEventListener("input", refreshFromFirstPage);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    refreshFromFirstPage();
  });
  // Move through result pages and refresh the visible cards.
  previousPage.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      render();
    }
  });
  nextPage.addEventListener("click", () => {
    currentPage += 1;
    render();
  });
  // Clear filters and return keyboard focus to the search field.
  reset.addEventListener("click", () => {
    resetFilters();
    search.focus();
  });

  // Prepare a suggestion email and open it in the visitor's email app.
  suggestionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(suggestionForm);
    const subject = `NearBites suggestion: ${formData.get("type")}`;
    const body = [
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      `Suggestion type: ${formData.get("type")}`,
      "",
      String(formData.get("message"))
    ].join("\n");
    const mailto = `mailto:jesusalcala0260@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    suggestionStatus.textContent = "Opening your email app. Review and send the suggestion there.";
    window.location.href = mailto;
  });

  render();
})();
