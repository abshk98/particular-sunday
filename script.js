const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const savedTheme = localStorage.getItem("site-theme");

if (savedTheme === "light" || savedTheme === "dark") {
  root.dataset.theme = savedTheme;
}

function updateThemeToggle() {
  const isDark = root.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("site-theme", nextTheme);
  updateThemeToggle();
});

updateThemeToggle();

const questCount = document.querySelector("[data-quest-count]");

if (questCount) {
  const countKey = "side-quest-count";
  const previousCount = Number(localStorage.getItem(countKey));
  let nextCount = Math.floor(Math.random() * 9999) + 1;

  if (nextCount === previousCount) {
    nextCount = (nextCount % 9999) + 1;
  }

  localStorage.setItem(countKey, String(nextCount));
  questCount.textContent = nextCount.toLocaleString();
}

const renaissanceSection = document.getElementById("renaissance");

if (renaissanceSection && "IntersectionObserver" in window) {
  const skillObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      renaissanceSection.classList.add("is-visible");
      skillObserver.disconnect();
    }
  }, { threshold: 0.15 });

  skillObserver.observe(renaissanceSection);
} else {
  renaissanceSection?.classList.add("is-visible");
}

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const closeButton = document.getElementById("closeButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function closeMobileMenu() {
  sidebar.classList.remove("mobile-open");
  sidebarOverlay.classList.remove("visible");
  document.body.style.overflow = "";
}

menuButton.addEventListener("click", () => {
  sidebar.classList.add("mobile-open");
  sidebarOverlay.classList.add("visible");
  document.body.style.overflow = "hidden";
});

closeButton.addEventListener("click", closeMobileMenu);
sidebarOverlay.addEventListener("click", closeMobileMenu);

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

const artworkGrid = document.getElementById("artworkGrid");

if (artworkGrid) {
  const artworkCards = [...artworkGrid.querySelectorAll(".artwork-card")];
  const filterButtons = [...document.querySelectorAll(".filter")];
  const artworkCount = document.getElementById("artworkCount");
  const emptyMessage = document.getElementById("emptyMessage");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxYear = document.getElementById("lightboxYear");
  const lightboxClose = document.getElementById("lightboxClose");

  let visibleArtworks = [];
  let currentArtworkIndex = 0;
  let lastArtworkButton = null;
  let swipeStart = null;

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
    swipeStart = null;
    lastArtworkButton?.focus();
  }

  function moveArtwork(direction) {
    if (visibleArtworks.length) showArtwork(currentArtworkIndex + direction);
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
  lightbox.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      swipeStart = null;
      return;
    }

    const touch = event.touches[0];
    swipeStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });

  lightbox.addEventListener("touchend", (event) => {
    if (!swipeStart || event.changedTouches.length !== 1) {
      swipeStart = null;
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;
    swipeStart = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    moveArtwork(deltaX < 0 ? 1 : -1);
  }, { passive: true });

  lightbox.addEventListener("touchcancel", () => {
    swipeStart = null;
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (lightbox.classList.contains("open")) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveArtwork(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveArtwork(-1);
      } else if (event.key === "Escape") {
        closeLightbox();
      }
    } else if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  updateGallery("all");
} else {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}
