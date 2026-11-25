const artworkCards = [...document.querySelectorAll(".artwork-card")];
const filterButtons = [...document.querySelectorAll(".filter")];

const artworkCount = document.getElementById("artworkCount");
const emptyMessage = document.getElementById("emptyMessage");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxYear = document.getElementById("lightboxYear");
const lightboxClose = document.getElementById("lightboxClose");

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const closeButton = document.getElementById("closeButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");

let visibleArtworks = [];
let currentArtworkIndex = 0;
let lastArtworkButton = null;

function updateGallery(filter) {
  let visibleCount = 0;

  artworkCards.forEach((card) => {
    const matches = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !matches);
    if (matches) visibleCount++;
  });

  artworkCount.textContent = `${visibleCount} ${visibleCount === 1 ? "work" : "works"}`;
  emptyMessage.hidden = visibleCount > 0;
}

function getVisibleArtworks() {
  return artworkCards.filter((card) => {
    const image = card.querySelector("img");
    return !card.classList.contains("hidden") && image.naturalWidth > 0;
  });
}

function showArtwork(index) {
  currentArtworkIndex = (index + visibleArtworks.length) % visibleArtworks.length;

  const card = visibleArtworks[currentArtworkIndex];
  const image = card.querySelector("img");

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = card.dataset.title || image.alt;
  lightboxYear.textContent = card.dataset.year || "";
}

function openLightbox(card) {
  visibleArtworks = getVisibleArtworks();
  currentArtworkIndex = visibleArtworks.indexOf(card);

  if (currentArtworkIndex === -1) return;

  lastArtworkButton = card.querySelector(".artwork-open");
  showArtwork(currentArtworkIndex);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
  lastArtworkButton?.focus();
}

function moveArtwork(direction) {
  if (!visibleArtworks.length) return;
  showArtwork(currentArtworkIndex + direction);
}

function openMobileMenu() {
  sidebar.classList.add("mobile-open");
  sidebarOverlay.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  sidebar.classList.remove("mobile-open");
  sidebarOverlay.classList.remove("visible");
  document.body.style.overflow = "";
}

artworkCards.forEach((card) => {
  const image = card.querySelector("img");
  const button = card.querySelector(".artwork-open");

  image.addEventListener("load", () => {
    button.classList.add("image-loaded");
    button.classList.remove("image-missing");
  });

  image.addEventListener("error", () => button.classList.add("image-missing"));

  if (image.complete && image.naturalWidth > 0) {
    button.classList.add("image-loaded");
  }

  button.addEventListener("click", () => openLightbox(card));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateGallery(button.dataset.filter);
  });
});

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveArtwork(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveArtwork(-1);
  } else if (event.key === "Escape") {
    closeLightbox();
  }
});

menuButton.addEventListener("click", openMobileMenu);
closeButton.addEventListener("click", closeMobileMenu);
sidebarOverlay.addEventListener("click", closeMobileMenu);

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

updateGallery("all");
