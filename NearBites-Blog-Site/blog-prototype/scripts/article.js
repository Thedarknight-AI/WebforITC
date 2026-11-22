// Load the requested story and fill the article page with its content.
(() => {
  const params = new URLSearchParams(window.location.search);
  const story = window.NearBitesJournal.stories.find((item) => item.slug === params.get("story"));
  const main = document.querySelector("[data-story-body]");

  // Show a recovery message when the URL has no matching story.
  if (!story) {
    document.title = "Story not found — NearBites Journal";
    document.querySelector(".story-header").innerHTML = `
      <p class="eyebrow">NearBites Journal</p>
      <h1>We couldn't find that story.</h1>
      <p class="story-deck">Head back to the journal to find something good to read.</p>`;
    document.querySelector(".story-cover").hidden = true;
    main.innerHTML = '<p><a class="text-link" href="index.html#latest">Browse all stories ↗</a></p>';
    document.querySelector(".story-note").hidden = true;
    document.querySelector(".story-return").hidden = true;
    return;
  }

  // Populate the article details, photo gallery, and story paragraphs.
  document.title = `${story.title} — NearBites Journal`;
  document.querySelector("[data-story-category]").textContent = story.category;
  document.querySelector("[data-story-location]").textContent = story.location;
  const locationLink = document.querySelector("[data-story-location-link]");
  if (story.locationUrl) {
    const url = new URL(story.locationUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new TypeError("Story location links must use http or https.");
    }
    locationLink.href = url.href;
    locationLink.hidden = false;
  }
  document.querySelector("[data-story-title]").textContent = story.title;
  document.querySelector("[data-story-summary]").textContent = story.summary;
  document.querySelector("[data-story-budget]").textContent = `Estimated budget: ₱${story.budget} per person (sample estimate)`;
  window.initPhotoGallery(document.querySelector("[data-story-gallery]"), story.images);

  story.body.forEach((paragraph) => {
    const element = document.createElement("p");
    element.textContent = paragraph;
    main.append(element);
  });
})();
