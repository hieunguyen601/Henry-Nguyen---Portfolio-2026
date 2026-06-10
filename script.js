const year = document.getElementById("year");
year.innerHTML = new Date().getFullYear();

document.querySelectorAll(".activities-btn a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = this.href;
    document.body.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = href;
    }, 350);
  });
});

const API_BASE = "/api/spotify";
const isGitHubPages = window.location.hostname.includes("github.io");

const SPOTIFY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954"/></svg>`;
const PLAY_ICON = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const PLUS_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;
const MORE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`;
const NOW_BARS = `<span class="now-playing-bars"><span></span><span></span><span></span></span>`;

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function spFetch(endpoint) {
  try {
    const res = await fetch(`${API_BASE}?endpoint=${endpoint}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.error ? null : data;
  } catch {
    return null;
  }
}

let spAudio = null;
let spPlayingId = null;

function updatePlayBtns(trackId, playing) {
  document.querySelectorAll(`[data-track-id="${trackId}"]`).forEach((btn) => {
    btn.classList.toggle("playing", playing);
    btn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
  });
}

function toggleSpPreview(previewUrl, trackId) {
  if (spAudio) {
    spAudio.pause();
    updatePlayBtns(spPlayingId, false);
    const wasSame = spPlayingId === trackId;
    spAudio = null;
    spPlayingId = null;
    if (wasSame) return;
  }
  if (!previewUrl) return;
  spAudio = new Audio(previewUrl);
  spAudio.volume = 0.5;
  spAudio.play();
  spPlayingId = trackId;
  updatePlayBtns(trackId, true);
  spAudio.addEventListener("ended", () => {
    updatePlayBtns(trackId, false);
    spAudio = null;
    spPlayingId = null;
  });
}

function buildFeatured(track, isNowPlaying = false, isTopTrack = false) {
  const art = escHtml(track.album.images[0]?.url || "");
  const album = escHtml(track.album.name);
  const name = escHtml(track.name);
  const artist = escHtml(track.artists.map((a) => a.name).join(", "));
  const preview = track.preview_url || "";
  const id = track.id;
  const url = escHtml(track.external_urls?.spotify || "#");

  const badge = isNowPlaying
    ? `<span class="now-playing-badge">${NOW_BARS} Now Playing</span>`
    : isTopTrack
      ? `<span class="preview-badge">#1 This Month</span>`
      : preview
        ? `<span class="preview-badge">Preview</span>`
        : "";

  return `
    <span class="sp-feat-spotify-icon">${SPOTIFY_ICON}</span>
    <img class="sp-feat-art" src="${art}" alt="${name}" loading="lazy">
    <p class="sp-feat-album">${album}</p>
    <p class="sp-feat-name">${name}</p>
    ${badge}
    <p class="sp-feat-artist">${artist}</p>
    <div class="sp-feat-footer">
      <a class="sp-save-link" href="${url}" target="_blank" rel="noopener noreferrer">
        ${PLUS_ICON} Save on Spotify
      </a>
      <button type="button" class="sp-feat-play-btn${preview ? "" : " no-preview"}" data-track-id="${id}">
        ${PLAY_ICON}
      </button>
    </div>`;
}

function buildTrackRow(track) {
  const images = track.album.images;
  const art = escHtml((images[images.length - 1] || images[0])?.url || "");
  const name = escHtml(track.name);
  const artist = escHtml(track.artists.map((a) => a.name).join(", "));
  const preview = track.preview_url || "";
  const id = track.id;
  const url = escHtml(track.external_urls?.spotify || "#");

  return `
    <div class="sp-track-row">
      <img class="sp-track-art" src="${art}" alt="${name}" loading="lazy">
      <div class="sp-track-info">
        <p class="sp-track-name">${name}</p>
        <p class="sp-track-artist">${artist}</p>
        ${preview ? '<span class="preview-badge">Preview</span>' : ""}
      </div>
      <div class="sp-track-controls">
        <span class="sp-track-spotify">${SPOTIFY_ICON}</span>
        <a class="sp-track-btn" href="${url}" target="_blank" rel="noopener noreferrer" title="Open on Spotify">${PLUS_ICON}</a>
        <button type="button" class="sp-track-btn" title="More">${MORE_ICON}</button>
        <button type="button" class="sp-track-play${preview ? "" : " no-preview"}" data-track-id="${id}">
          ${PLAY_ICON}
        </button>
      </div>
    </div>`;
}

function renderSpotify(tracks, nowPlaying, isTopTrack = false) {
  const featEl = document.getElementById("sp-featured");
  const listEl = document.getElementById("sp-list");
  if (!featEl || !listEl) return;

  const featured = nowPlaying || tracks[0];
  const listTracks = nowPlaying
    ? tracks.filter((t) => t.id !== nowPlaying.id).slice(0, 4)
    : tracks.slice(1, 5);

  if (!featured) {
    featEl.innerHTML = '<p class="sp-loading">Nothing to show yet.</p>';
    listEl.innerHTML = "";
    return;
  }

  featEl.innerHTML = buildFeatured(featured, !!nowPlaying, isTopTrack);
  listEl.innerHTML = listTracks.map(buildTrackRow).join("");

  const allTracks = [featured, ...listTracks];

  featEl.querySelector("[data-track-id]")?.addEventListener("click", (e) => {
    const t = allTracks.find((tr) => tr.id === e.currentTarget.dataset.trackId);
    if (t) toggleSpPreview(t.preview_url, t.id);
  });

  listEl.querySelectorAll("[data-track-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = listTracks.find((tr) => tr.id === btn.dataset.trackId);
      if (t) toggleSpPreview(t.preview_url, t.id);
    });
  });
}

let currentTab = "recent";

async function loadTracks(tab) {
  currentTab = tab;
  const featEl = document.getElementById("sp-featured");
  const listEl = document.getElementById("sp-list");
  if (featEl) featEl.innerHTML = '<p class="sp-loading">Loading...</p>';
  if (listEl) listEl.innerHTML = "";

  if (tab === "recent") {
    const [nowData, recentData] = await Promise.all([
      spFetch("currently-playing"),
      spFetch("recently-played"),
    ]);

    const nowPlaying = nowData?.is_playing ? nowData.item : null;
    const seen = new Set();
    const recentTracks = (recentData?.items || [])
      .map((i) => i.track)
      .filter((t) => (seen.has(t.id) ? false : seen.add(t.id)));

    const titleEl = document.getElementById("spotify-title");
    if (titleEl)
      titleEl.textContent = nowPlaying ? "Now Playing" : "Recently Played";
    renderSpotify(recentTracks, nowPlaying, false);
  } else {
    const data = await spFetch("top-tracks");
    const titleEl = document.getElementById("spotify-title");
    if (titleEl) titleEl.textContent = "#1 Track This Month";
    renderSpotify(data?.items || [], null, true);
  }
}

document.querySelectorAll(".spotify-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".spotify-tab")
      .forEach((t) => t.classList.remove("spotify-tab--active"));
    tab.classList.add("spotify-tab--active");
    const tabName = tab.dataset.tab;
    const titleEl = document.getElementById("spotify-title");
    if (titleEl)
      titleEl.textContent =
        tabName === "recent" ? "Recently Played" : "#1 Track This Month";
    if (isGitHubPages) {
      const featEl = document.getElementById("sp-featured");
      if (featEl) featEl.innerHTML = '<p class="sp-loading">Live Spotify data is available on the <a href="https://single-page-developer-portfolio-nu.vercel.app/mainPage.html" target="_blank" rel="noopener noreferrer" style="color:#4ee1a0;text-decoration:underline">deployed version</a>.</p>';
      return;
    }
    loadTracks(tabName);
  });
});

if (isGitHubPages) {
  const featEl = document.getElementById("sp-featured");
  const listEl = document.getElementById("sp-list");
  if (featEl) featEl.innerHTML = '<p class="sp-loading">Live Spotify data is available on the <a href="https://single-page-developer-portfolio-nu.vercel.app/mainPage.html" target="_blank" rel="noopener noreferrer" style="color:#4ee1a0;text-decoration:underline">deployed version</a>.</p>';
  if (listEl) listEl.innerHTML = "";
} else {
  setInterval(() => {
    if (currentTab === "recent" && !spAudio) loadTracks("recent");
  }, 30000);
  loadTracks("recent");
}

(function () {
  const el = document.getElementById("myName");
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = "";
  el.classList.add("typing");
  let i = 0;
  setTimeout(function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 55);
    } else {
      setTimeout(() => el.classList.remove("typing"), 800);
    }
  }, 500);
})();

(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme") || "dark";
  if (saved === "light") root.setAttribute("data-theme", "light");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
})();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 0.07}s`;
  revealObserver.observe(el);
});

document.querySelectorAll(".proj-filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".proj-filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    document.querySelectorAll(".project").forEach((project) => {
      const tech = project.dataset.tech || "";
      const show = filter === "all" || tech.includes(filter);
      project.classList.toggle("hidden", !show);
    });
  });
});

const contactForm = document.getElementById("form");
const sendBtn = document.getElementById("btn-send");

if (contactForm && sendBtn) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        sendBtn.textContent = "Sent ✓";
        contactForm.reset();
        setTimeout(() => {
          sendBtn.disabled = false;
          sendBtn.textContent = "Send Message";
        }, 4000);
      } else {
        throw new Error();
      }
    } catch {
      sendBtn.disabled = false;
      sendBtn.textContent = "Error — try again";
      setTimeout(() => {
        sendBtn.textContent = "Send Message";
      }, 3000);
    }
  });
}

(function () {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
    },
    { passive: true },
  );
})();

(function () {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 300);
    },
    { passive: true },
  );
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

(function () {
  const statsRow = document.querySelector(".stats-row");
  if (!statsRow) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const frameTime = 16;
    const totalFrames = Math.round(1400 / frameTime);
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
      el.textContent = Math.min(Math.floor(eased * target), target);
      if (frame >= totalFrames) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, frameTime);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".stat-num").forEach(animateCounter);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 },
  );

  observer.observe(statsRow);
})();
