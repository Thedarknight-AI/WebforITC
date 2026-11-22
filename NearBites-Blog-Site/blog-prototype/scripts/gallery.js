// Set up photo navigation and captions for a gallery on either page.
window.initPhotoGallery = (gallery, photos) => {
  const image = gallery.querySelector("[data-gallery-image]");
  const previous = gallery.querySelector("[data-gallery-previous]");
  const next = gallery.querySelector("[data-gallery-next]");
  const position = gallery.querySelector("[data-gallery-position]");
  let currentIndex = 0;

  // Keep the displayed image, buttons, and position label in sync.
  const update = () => {
    const photo = photos[currentIndex];
    image.src = photo.src;
    image.alt = photo.alt;
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === photos.length - 1;
    position.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    position.setAttribute("aria-label", `Photo ${currentIndex + 1} of ${photos.length}`);
  };

  previous.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      update();
    }
  });
  next.addEventListener("click", () => {
    if (currentIndex < photos.length - 1) {
      currentIndex += 1;
      update();
    }
  });

  update();
};
