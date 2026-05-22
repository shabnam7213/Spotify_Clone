// ── DEEZER API CONFIG ───────────────────────────────────
const API = "https://deezerdevs-deezer.p.rapidapi.com";

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "fc3beab6b8msh9ea017de08ab409p12eebdjsn6534c5a5d963",
    "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
  },
};

// ── STATE ───────────────────────────────────────────────
let tracks = [];
let curIdx = 0;
let liked = [];
let shuffleOn = false;
let searchTimer = null;

// ── ELEMENTS ────────────────────────────────────────────
const audio = document.getElementById("audio");
const content = document.getElementById("contentArea");
const searchIn = document.getElementById("searchInput");

// ── API ─────────────────────────────────────────────────
async function fetchSongs(query) {

  try {

    const res = await fetch(
      `${API}/search?q=${encodeURIComponent(query)}`,
      options
    );

    const data = await res.json();

    return (data.data || []).map(track => ({

      id: track.id,

      name: track.title,

      artist_name: track.artist?.name || "Unknown Artist",

      album_name: track.album?.title || "Unknown Album",

      image: track.album?.cover_medium || "",

      audio: track.preview || "",

      duration: track.duration || 0,

    }));

  } catch (err) {

    console.error(err);

    toast("Failed to load songs");

    return [];
  }
}

async function getTracks(tag, limit = 10) {

  const songs = await fetchSongs(tag);

  return songs.slice(0, limit);
}

async function searchTracks(q) {
  return await fetchSongs(q);
}

async function getArtistTracks(name) {
  return await fetchSongs(name);
}

// ── UTILS ───────────────────────────────────────────────
function fmt(s) {

  if (!s || isNaN(s)) return "0:00";

  return `${Math.floor(s / 60)}:${String(
    Math.floor(s % 60)
  ).padStart(2, "0")}`;
}

function toast(msg) {

  const t = document.getElementById("toast");

  t.textContent = msg;

  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2200);
}

function setNav() {

  document.querySelectorAll(".nav-item")
    .forEach(n => n.classList.remove("active"));
}

function greeting() {

  const h = new Date().getHours();

  if (h < 12) return "morning";

  if (h < 17) return "afternoon";

  return "evening";
}

// ── TABLE ───────────────────────────────────────────────
function renderTable(list) {

  if (!list.length) {

    return `
      <div class="empty">
        No tracks found
      </div>
    `;
  }

  return `

    <div class="tracklist">

      <div class="tracklist-head">

        <span>#</span>

        <span>Title</span>

        <span>Album</span>

        <span style="text-align:right">⏱</span>

      </div>

      ${list.map((t, i) => `

        <div class="track-row"
             onclick="playIdx(${i})">

          <span class="t-num">
            ${i + 1}
          </span>

          <div class="t-info">

            <img class="t-thumb"
                 src="${t.image}"
                 alt="">

            <div class="t-texts">

              <div class="t-name">
                ${t.name}
              </div>

              <div class="t-artist">
                ${t.artist_name}
              </div>

            </div>

          </div>

          <span class="t-album">
            ${t.album_name}
          </span>

          <span class="t-dur">
            ${fmt(t.duration)}
          </span>

        </div>

      `).join("")}

    </div>
  `;
}

// ── HOME ────────────────────────────────────────────────
async function goHome() {

  setNav();

  document.querySelectorAll(".nav-item")[0]
    .classList.add("active");

  content.innerHTML = `
    <div class="loading">
      Loading songs...
    </div>
  `;

  const [bolly, pop, chill] = await Promise.all([

    getTracks("bollywood hits", 8),

    getTracks("pop songs", 8),

    getTracks("chill songs", 8),

  ]);

  const artists = [

    { name: "Arijit Singh", emoji: "🎤" },

    { name: "Shreya Ghoshal", emoji: "🎶" },

    { name: "Atif Aslam", emoji: "🎵" },

    { name: "KK", emoji: "🎙" },

    { name: "Armaan Malik", emoji: "🎧" },

  ];

  content.innerHTML = `

    <div class="sec-header">

      <span class="sec-title">
        Good ${greeting()}
      </span>

    </div>

    <div class="sec-header">

      <span class="sec-title">
        Featured Artists
      </span>

    </div>

    <div class="artist-grid">

      ${artists.map(a => `

        <div class="artist-card"
             onclick="loadArtist('${a.name}')">

          <div class="ac-wrap">

            <div class="ac-img-ph">
              ${a.emoji}
            </div>

          </div>

          <div class="ac-name">
            ${a.name}
          </div>

          <div class="ac-type">
            Artist
          </div>

        </div>

      `).join("")}

    </div>

    <div class="sec-header">
      <span class="sec-title">
        Bollywood Hits
      </span>
    </div>

    ${renderMiniList(bolly, "bolly")}

    <div class="sec-header">
      <span class="sec-title">
        Pop Songs
      </span>
    </div>

    ${renderMiniList(pop, "pop")}

    <div class="sec-header">
      <span class="sec-title">
        Chill Songs
      </span>
    </div>

    ${renderMiniList(chill, "chill")}

  `;
}

// ── MINI LIST ───────────────────────────────────────────
function renderMiniList(list, key) {

  window["_sect_" + key] = list;

  return `

    <div class="tracklist">

      ${list.map((t, i) => `

        <div class="track-row"
             onclick="playSection('${key}',${i})">

          <span class="t-num">
            ${i + 1}
          </span>

          <div class="t-info">

            <img class="t-thumb"
                 src="${t.image}">

            <div class="t-texts">

              <div class="t-name">
                ${t.name}
              </div>

              <div class="t-artist">
                ${t.artist_name}
              </div>

            </div>

          </div>

          <span class="t-album">
            ${t.album_name}
          </span>

          <span class="t-dur">
            ${fmt(t.duration)}
          </span>

        </div>

      `).join("")}

    </div>
  `;
}

function playSection(key, i) {

  tracks = window["_sect_" + key];

  curIdx = i;

  startPlay(tracks[i]);
}

// ── ARTIST PAGE ─────────────────────────────────────────
async function loadArtist(name) {

  content.innerHTML = `
    <div class="loading">
      Loading ${name}...
    </div>
  `;

  const list = await getArtistTracks(name);

  tracks = list;

  content.innerHTML = `

    <div style="padding:20px 0">

      <h1 style="font-size:48px;font-weight:900">
        ${name}
      </h1>

      <p style="color:gray">
        ${list.length} tracks
      </p>

    </div>

    ${renderTable(list)}

  `;
}

// ── SEARCH ──────────────────────────────────────────────
async function goSearch() {

  setNav();

  document.querySelectorAll(".nav-item")[1]
    .classList.add("active");

  content.innerHTML = `
    <div class="loading">
      Search songs or artists...
    </div>
  `;
}

async function runSearch(q) {

  if (!q.trim()) {
    goSearch();
    return;
  }

  content.innerHTML = `
    <div class="loading">
      Searching "${q}"...
    </div>
  `;

  const list = await searchTracks(q);

  tracks = list;

  content.innerHTML = `

    <div class="sec-header">

      <span class="sec-title">

        Results for "${q}"

      </span>

    </div>

    ${renderTable(list)}

  `;
}

// ── LIKED SONGS ─────────────────────────────────────────
function goLiked() {

  setNav();

  document.querySelectorAll(".nav-item")[2]
    .classList.add("active");

  if (!liked.length) {

    content.innerHTML = `

      <div style="padding:40px">

        <h1 style="font-size:48px;font-weight:900">

          Liked Songs

        </h1>

        <p style="color:gray">

          No liked songs yet

        </p>

      </div>

    `;

    return;
  }

  tracks = liked;

  content.innerHTML = `

    <div style="padding:20px 0">

      <h1 style="font-size:48px;font-weight:900">

        Liked Songs

      </h1>

      <p style="color:gray">

        ${liked.length} songs

      </p>

    </div>

    ${renderTable(liked)}

  `;
}

// ── PLAYBACK ────────────────────────────────────────────
function playIdx(i) {

  if (!tracks[i]) return;

  curIdx = i;

  startPlay(tracks[i]);
}

function startPlay(song) {

  if (!song.audio) {

    toast("Preview not available");

    return;
  }

  audio.src = song.audio;

  audio.play();

  updateNowPlaying(song);
}

function togglePlay() {

  if (!tracks.length) return;

  // first play
  if (!audio.src) {

    playIdx(0);

    return;
  }

  // pause
  if (!audio.paused) {

    audio.pause();

  }

  // resume
  else {

    audio.play();

  }
}

function nextTrack() {

  if (shuffleOn) {

    curIdx = Math.floor(
      Math.random() * tracks.length
    );

  } else {

    curIdx = (curIdx + 1) % tracks.length;
  }

  startPlay(tracks[curIdx]);
}

function prevTrack() {

  curIdx = (
    curIdx - 1 + tracks.length
  ) % tracks.length;

  startPlay(tracks[curIdx]);
}

// ── AUDIO EVENTS ────────────────────────────────────────
audio.addEventListener("ended", () => {
  nextTrack();
});

audio.addEventListener("play", () => {
  setPlayIcon(true);
});

audio.addEventListener("pause", () => {
  setPlayIcon(false);
});

audio.addEventListener("timeupdate", () => {

  if (!audio.duration) return;

  const p = (
    audio.currentTime / audio.duration
  ) * 100;

  document.getElementById("progFill")
    .style.width = p + "%";

  document.getElementById("curTime")
    .textContent = fmt(audio.currentTime);

  document.getElementById("totTime")
    .textContent = fmt(audio.duration);
});

// ── PLAY ICON ───────────────────────────────────────────
function setPlayIcon(isPlaying) {

  const icon =
    document.getElementById("playIcon");

  // pause icon
  if (isPlaying) {

    icon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;

  }

  // play icon
  else {

    icon.innerHTML = `
      <path d="M5 3l14 9-14 9V3z"></path>
    `;
  }
}

// ── NOW PLAYING ─────────────────────────────────────────
function updateNowPlaying(song) {

  document.getElementById("nowName")
    .textContent = song.name;

  document.getElementById("nowArtist")
    .textContent = song.artist_name;

  document.getElementById("nowThumb")
    .src = song.image;

  updateLikeButton(song);
}

// ── LIKE SONG ───────────────────────────────────────────
function toggleLike() {

  if (!tracks[curIdx]) return;

  const song = tracks[curIdx];

  const exists = liked.find(
    item => item.id === song.id
  );

  // remove
  if (exists) {

    liked = liked.filter(
      item => item.id !== song.id
    );

    toast("Removed from liked songs");

  }

  // add
  else {

    liked.push(song);

    toast("Added to liked songs ♥");
  }

  updateLikeButton(song);
}

function updateLikeButton(song) {

  const btn =
    document.getElementById("heartBtn");

  const isLiked = liked.find(
    item => item.id === song.id
  );

  // liked
  if (isLiked) {

    btn.classList.add("liked");

    btn.innerHTML = `
      ❤️
    `;

  }

  // not liked
  else {

    btn.classList.remove("liked");

    btn.innerHTML = `
      🤍
    `;
  }
}

// ── SEARCH ──────────────────────────────────────────────
searchIn.addEventListener("input", () => {

  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {

    runSearch(searchIn.value.trim());

  }, 400);
});

// ── KEYBOARD ────────────────────────────────────────────
document.addEventListener("keydown", e => {

  if (document.activeElement === searchIn)
    return;

  // space play pause
  if (e.code === "Space") {

    e.preventDefault();

    togglePlay();
  }

  // next
  if (e.code === "KeyN") {
    nextTrack();
  }

  // previous
  if (e.code === "KeyP") {
    prevTrack();
  }
});

// ── INIT ────────────────────────────────────────────────
goHome();