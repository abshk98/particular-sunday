const gardenContent = {
  soundtrack: {
    // Add each yearly recap with its summary image, top albums, top songs and Top 100 playlist.
    wrapped: [],
    favourites: []
  },
  artShelf: [],
  readingRoom: [
    {
      title: "Maker's Schedule, Manager's Schedule",
      author: "Paul Graham",
      url: "https://paulgraham.com/makersschedule.html",
      note: "A useful distinction between uninterrupted creative time and meeting-heavy days."
    },
    {
      title: "Seth's Blog",
      author: "Seth Godin",
      url: "https://seths.blog/",
      note: "Short notes on ideas, work and the things worth paying attention to."
    }
  ],
  internetFinds: [
    {
      category: "Cool Personal Sites",
      entries: [
        {
          name: "Samarth Bansal",
          url: "https://samarthbansal.com/",
          mark: "SB",
          note: "A personal website worth exploring."
        }
      ]
    },
    {
      category: "Tools",
      entries: [
        {
          name: "Desmos",
          url: "https://www.desmos.com/calculator",
          mark: "D",
          note: "Loved using this during my Master's."
        },
        {
          name: "Wolfram Alpha",
          url: "https://www.wolframalpha.com/",
          mark: "W",
          note: "Another favourite from my Master's days."
        },
        {
          name: "A Soft Murmur",
          url: "https://asoftmurmur.com/",
          mark: "AM",
          note: "A really nice ambient sound generator."
        },
        {
          name: "iTunes Artwork Finder",
          url: "https://bendodson.com/projects/itunes-artwork-finder/",
          mark: "IA",
          note: "A neat little tool for finding album artwork."
        }
      ]
    }
  ],
  looseThoughts: []
};

function gardenEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function gardenExternalUrl(value) {
  if (!value) return "";
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new TypeError(`Expected an HTTPS URL, received: ${value}`);
  }
  return gardenEscape(url.href);
}

function gardenImageUrl(value) {
  if (!value) return "";
  if (value.startsWith("./") || value.startsWith("../")) {
    return gardenEscape(value);
  }
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new TypeError(`Expected an HTTPS image URL or relative path, received: ${value}`);
  }
  return gardenEscape(url.href);
}

function gardenImageButton(image, alt, label, srcset, sizes) {
  const src = gardenImageUrl(image);
  if (!src) return "";

  const safeAlt = gardenEscape(alt || label);
  const responsiveSources = srcset
    ? ` srcset="${gardenEscape(srcset)}" sizes="${gardenEscape(sizes || "(max-width: 760px) 50vw, 25vw")}"`
    : "";
  return `
    <button class="garden-image-button" type="button" data-garden-image
      data-image-src="${src}" data-image-alt="${safeAlt}" aria-label="View ${gardenEscape(label)}">
      <img src="${src}"${responsiveSources} alt="${safeAlt}" loading="lazy" decoding="async">
    </button>
  `;
}

function renderWrappedEntry(entry) {
  const year = gardenEscape(entry.year || "TO COME");
  const summaryPhoto = entry.summaryImage
    ? gardenImageButton(
      entry.summaryImage,
      `Spotify Wrapped ${entry.year || ""} summary`,
      `Spotify Wrapped ${entry.year || ""} summary`,
      entry.summaryImageSrcset,
      entry.summaryImageSizes
    )
    : `
      <div class="wrapped-summary-placeholder">
        <span>YEAR IN MUSIC</span>
        <strong>Spotify<br>Wrapped</strong>
        <small>SUMMARY PHOTO</small>
      </div>
    `;
  const playlist = entry.top100 || {};
  const playlistCover = playlist.image
    ? gardenSmallImageButton(playlist.image, "Top 100 playlist cover", playlist.imageSrcset, playlist.imageSizes)
    : `<div class="top100-cover" aria-hidden="true"><span>MY</span><strong>TOP<br>100</strong><span>SONGS</span></div>`;
  const playlistUrl = gardenExternalUrl(playlist.url || "");
  const playlistLink = playlistUrl
    ? `<a class="top100-link" href="${playlistUrl}" target="_blank" rel="noopener noreferrer">Open playlist ↗</a>`
    : "";
  const albums = renderWrappedList("Top albums", entry.topAlbums || [], "album");
  const songs = renderWrappedList("Top songs", entry.topSongs || [], "song");
  const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];

  return `
    <article class="wrapped-year">
      <div class="wrapped-year-heading">
        <span class="kicker">SPOTIFY WRAPPED</span>
        <span class="wrapped-year-label">${year}</span>
      </div>
      <div class="wrapped-feature">
        <div class="wrapped-recap">
          <figure class="wrapped-summary">
            ${summaryPhoto}
            <figcaption>Summary photo</figcaption>
          </figure>
          <div class="wrapped-rankings">
            ${albums}
            ${songs}
          </div>
        </div>
        <aside class="wrapped-top100">
          <div class="top100-heading">
            ${playlistCover}
            <div>
              <span class="kicker">THE LONG PLAY</span>
              <h3>My Top 100 Songs</h3>
              ${playlistLink}
            </div>
          </div>
          ${renderTop100Tracks(tracks)}
        </aside>
      </div>
    </article>
  `;
}

function gardenSmallImageButton(image, alt, srcset, sizes) {
  const src = gardenImageUrl(image);
  const responsiveSources = srcset
    ? ` srcset="${gardenEscape(srcset)}" sizes="${gardenEscape(sizes || "72px")}"`
    : "";
  return `
    <button class="wrapped-list-image" type="button" data-garden-image
      data-image-src="${src}" data-image-alt="${gardenEscape(alt)}" aria-label="View ${gardenEscape(alt)}">
      <img src="${src}"${responsiveSources} alt="${gardenEscape(alt)}" loading="lazy" decoding="async">
    </button>
  `;
}

function renderWrappedList(title, entries, type) {
  const rows = entries.map((entry, index) => {
    const name = typeof entry === "string" ? entry : entry.title || entry.name;
    const artist = typeof entry === "string" ? "" : entry.artist;
    const image = type === "album" && entry.image
      ? gardenSmallImageButton(entry.image, name, entry.imageSrcset, entry.imageSizes)
      : `<span class="wrapped-rank-art is-${type}" aria-hidden="true"></span>`;

    return `
      <li>
        <span class="wrapped-rank-number">${String(index + 1).padStart(2, "0")}</span>
        ${image}
        <span class="wrapped-rank-copy">
          <strong>${gardenEscape(name)}</strong>
          ${artist ? `<small>${gardenEscape(artist)}</small>` : ""}
        </span>
      </li>
    `;
  }).join("");
  const emptyMessage = type === "album"
    ? "A few records that shaped the year."
    : "Songs worth keeping from this stretch of life.";

  return `
    <section class="wrapped-rank-group">
      <h3>${gardenEscape(title)}</h3>
      ${rows
        ? `<ol>${rows}</ol>`
        : `<div class="wrapped-list-empty"><span class="wrapped-empty-mark" aria-hidden="true">♪</span><p>${emptyMessage}</p></div>`}
    </section>
  `;
}

function renderTop100Tracks(tracks) {
  if (!tracks.length) {
    return `
      <div class="top100-empty">
        <p>A long-play list for the years that deserve one.</p>
      </div>
    `;
  }

  const renderTrack = (track, index) => {
    const title = typeof track === "string" ? track : track.title || track.name;
    const artist = typeof track === "string" ? "" : track.artist;
    return `
      <li>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${gardenEscape(title)}</strong>
        ${artist ? `<small>${gardenEscape(artist)}</small>` : ""}
      </li>
    `;
  };
  const preview = tracks.slice(0, 4).map(renderTrack).join("");
  const remaining = tracks.slice(4).map((track, index) => renderTrack(track, index + 4)).join("");
  const moreTracks = remaining
    ? `<details class="top100-more"><summary>See the remaining ${tracks.length - 4} songs</summary><ol>${remaining}</ol></details>`
    : "";

  return `<ol class="top100-track-preview">${preview}</ol>${moreTracks}`;
}

function renderFavourite(entry) {
  const title = gardenEscape(entry.title || entry.name);
  const type = entry.type ? `<span class="kicker">${gardenEscape(entry.type)}</span>` : "";
  const artist = entry.artist ? `<p class="garden-byline">${gardenEscape(entry.artist)}</p>` : "";
  const year = entry.year ? `<span class="garden-year">${gardenEscape(entry.year)}</span>` : "";
  const artwork = entry.image
    ? gardenImageButton(entry.image, entry.alt || title, title, entry.imageSrcset, entry.imageSizes)
    : `<div class="garden-cover-placeholder" aria-hidden="true"><span>${title}</span></div>`;

  return `
    <article class="garden-favourite">
      ${artwork}
      <div class="garden-favourite-caption">
        <div>${type}<h3>${title}</h3>${artist}</div>${year}
        ${entry.note ? `<p>${gardenEscape(entry.note)}</p>` : ""}
      </div>
    </article>
  `;
}

function renderSoundtrack() {
  const wrappedEntries = gardenContent.soundtrack.wrapped.length
    ? gardenContent.soundtrack.wrapped
    : [{ year: "TO COME" }];
  const wrapped = wrappedEntries.map(renderWrappedEntry).join("");
  const favourites = gardenContent.soundtrack.favourites.map(renderFavourite).join("");

  document.getElementById("garden-soundtrack").innerHTML = `
    <div class="wrapped-years">${wrapped}</div>
    ${favourites ? `<section class="garden-on-repeat"><h3>On repeat</h3><div class="garden-soundtrack-grid">${favourites}</div></section>` : ""}
  `;
}

function renderArtShelf() {
  const entries = gardenContent.artShelf.map((entry) => {
    const title = entry.title ? `<h3>${gardenEscape(entry.title)}</h3>` : "";
    const artist = entry.artist ? `<p class="garden-byline">${gardenEscape(entry.artist)}</p>` : "";
    const note = entry.note ? `<p class="garden-art-note">${gardenEscape(entry.note)}</p>` : "";
    const image = entry.image
      ? gardenImageButton(entry.image, entry.alt || entry.title || entry.artist, entry.title || entry.artist, entry.imageSrcset, entry.imageSizes)
      : `<div class="garden-art-placeholder" aria-hidden="true"></div>`;
    const url = gardenExternalUrl(entry.url || "");
    const artistName = url
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${gardenEscape(entry.artist || entry.title)}</a>`
      : "";

    return `
      <figure class="garden-art-entry">
        ${image}
        <figcaption>${title}${artistName || artist}${note}</figcaption>
      </figure>
    `;
  }).join("");

  document.getElementById("garden-art-shelf").innerHTML = entries
    ? `<div class="garden-art-grid">${entries}</div>`
    : `<div class="garden-empty-note"><p>A shelf for artists, illustrators and pieces worth returning to.</p></div>`;
}

function renderReadingRoom() {
  document.getElementById("garden-reading-room").innerHTML = `
    <div class="reading-list">
      ${gardenContent.readingRoom.map((entry) => {
        const url = gardenExternalUrl(entry.url);
        const title = gardenEscape(entry.title);
        const linkedTitle = url
          ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title} ↗</a>`
          : title;

        return `
          <article class="reading-entry">
            <h3>${linkedTitle}</h3>
            <p class="reading-author">By ${gardenEscape(entry.author)}</p>
            ${entry.note ? `<p class="reading-note">${gardenEscape(entry.note)}</p>` : ""}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderInternetFinds() {
  document.getElementById("garden-internet-finds").innerHTML = gardenContent.internetFinds
    .map((group) => `
      <section class="internet-group">
        <h3>${gardenEscape(group.category)}</h3>
        <div class="internet-list">
          ${group.entries.map((entry) => {
            const url = gardenExternalUrl(entry.url);
            return `
              <a class="internet-entry" href="${url || "#"}" target="_blank" rel="noopener noreferrer">
                <span class="internet-favicon" aria-hidden="true">
                  <span>${gardenEscape(entry.mark || entry.name.slice(0, 2))}</span>
                  ${entry.favicon ? `<img src="${gardenImageUrl(entry.favicon)}" alt="" loading="lazy" decoding="async">` : ""}
                </span>
                <span class="internet-copy">
                  <span class="internet-name">${gardenEscape(entry.name)} <span aria-hidden="true">↗</span></span>
                  <span class="internet-note">${gardenEscape(entry.note)}</span>
                  <span class="garden-tag">${gardenEscape(group.category)}</span>
                </span>
              </a>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");

  document.querySelectorAll(".internet-favicon img").forEach((image) => {
    image.addEventListener("error", () => image.remove(), { once: true });
  });
}

function renderLooseThoughts() {
  const entries = gardenContent.looseThoughts.map((entry) => {
    const image = entry.image
      ? gardenImageButton(entry.image, entry.alt || entry.title || "Personal photograph", entry.title || "Personal photograph", entry.imageSrcset, entry.imageSizes)
      : "";
    const date = entry.date
      ? `<time class="loose-date">${gardenEscape(entry.date)}</time>`
      : "";
    const title = entry.title ? `<h3>${gardenEscape(entry.title)}</h3>` : "";
    const body = entry.body ? `<p>${gardenEscape(entry.body)}</p>` : "";
    const url = gardenExternalUrl(entry.url || "");
    const link = url
      ? `<a class="loose-link" href="${url}" target="_blank" rel="noopener noreferrer">Follow the thread ↗</a>`
      : "";

    return `<article class="loose-entry">${image}${date}${title}${body}${link}</article>`;
  }).join("");

  document.getElementById("garden-loose-thoughts").innerHTML = entries
    ? `<div class="loose-grid">${entries}</div>`
    : `<div class="loose-paper"><p>A blank page for things still finding their words.</p></div>`;
}

renderSoundtrack();
renderArtShelf();
renderReadingRoom();
renderInternetFinds();
renderLooseThoughts();

const gardenIndexLinks = [...document.querySelectorAll(".garden-index a")];
const gardenSections = [...document.querySelectorAll(".garden-section")];
function updateGardenIndex() {
  const markerY = window.innerHeight * 0.25;
  const currentSection = gardenSections
    .filter((section) => section.getBoundingClientRect().top <= markerY)
    .at(-1);
  gardenIndexLinks.forEach((link) => {
    if (currentSection && link.hash === `#${currentSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let gardenIndexUpdatePending = false;
window.addEventListener("scroll", () => {
  if (gardenIndexUpdatePending) return;
  gardenIndexUpdatePending = true;
  requestAnimationFrame(() => {
    gardenIndexUpdatePending = false;
    updateGardenIndex();
  });
}, { passive: true });
window.addEventListener("resize", updateGardenIndex);
updateGardenIndex();

const gardenLightbox = document.getElementById("garden-lightbox");
const gardenLightboxImage = gardenLightbox.querySelector("img");
const gardenLightboxCaption = gardenLightbox.querySelector(".garden-lightbox-caption");
const gardenLightboxClose = gardenLightbox.querySelector(".garden-lightbox-close");
let lastGardenImageButton = null;

function closeGardenLightbox() {
  gardenLightbox.hidden = true;
  gardenLightbox.setAttribute("aria-hidden", "true");
  gardenLightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
  lastGardenImageButton?.focus();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-garden-image]");
  if (button) {
    lastGardenImageButton = button;
    gardenLightboxImage.src = button.dataset.imageSrc;
    gardenLightboxImage.alt = button.dataset.imageAlt;
    gardenLightboxCaption.textContent = button.dataset.imageAlt;
    gardenLightbox.hidden = false;
    gardenLightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    gardenLightboxClose.focus();
  } else if (event.target === gardenLightbox) {
    closeGardenLightbox();
  }
});

gardenLightboxClose.addEventListener("click", closeGardenLightbox);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !gardenLightbox.hidden) {
    closeGardenLightbox();
  }
});
