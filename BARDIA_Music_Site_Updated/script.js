/*
  راهنمای افزودن آهنگ:
  1) فایل MP3 را داخل assets/music قرار بده.
  2) تصویر کاور را داخل assets/images قرار بده.
  3) یک شیء جدید به آرایه songs اضافه کن.
*/
const songs = [
  {
    id: "song-1",
    title: "نام آهنگ اول",
    cover: "assets/images/cover-placeholder.svg",
    file: "assets/music/song-1.mp3",
    date: "۱۴۰۵/۰۸/۱۰",
    category: "new",
    lyrics: `متن ترانه آهنگ اول را اینجا وارد کن.
برای رفتن به خط بعد، متن را در خط جدید بنویس.`
  },
  {
    id: "song-2",
    title: "نام آهنگ دوم",
    cover: "assets/images/cover-placeholder.svg",
    file: "assets/music/song-2.mp3",
    date: "۱۴۰۵/۰۷/۲۰",
    category: "popular",
    lyrics: `متن ترانه آهنگ دوم را اینجا وارد کن.`
  },
  {
    id: "song-3",
    title: "نام آهنگ سوم",
    cover: "assets/images/cover-placeholder.svg",
    file: "assets/music/song-3.mp3",
    date: "۱۴۰۵/۰۶/۱۵",
    category: "popular",
    lyrics: `متن ترانه آهنگ سوم را اینجا وارد کن.`
  }
];

const audio = document.getElementById("audio");
const songList = document.getElementById("songList");
const searchInput = document.getElementById("searchInput");
const playButton = document.getElementById("playButton");
let currentSongIndex = -1;
let activeFilter = "all";

function toPersianNumber(value) {
  return String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "۰:۰۰";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return toPersianNumber(`${mins}:${secs}`);
}
function getSongUrl(song) {
  return `?song=${encodeURIComponent(song.id)}`;
}
function renderSongs() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = songs.filter(song => {
    const matchesQuery = song.title.toLocaleLowerCase().includes(query);
    const matchesFilter = activeFilter === "all" || song.category === activeFilter;
    return matchesQuery && matchesFilter;
  });
  document.getElementById("songCount").textContent = `${toPersianNumber(filtered.length)} آهنگ`;
  songList.innerHTML = "";
  if (!filtered.length) {
    songList.innerHTML = '<div class="empty-state">آهنگی با این مشخصات پیدا نشد.</div>';
    return;
  }

  filtered.forEach((song, index) => {
    const realIndex = songs.findIndex(item => item.id === song.id);
    const row = document.createElement("article");
    row.className = "song-row";
    row.innerHTML = `
      <span class="song-number">${toPersianNumber(index + 1)}</span>
      <img class="song-cover" alt="کاور آهنگ">
      <div class="song-info"><strong></strong><small>بردیا · ${song.date}</small></div>
      <div class="song-actions">
        <button class="song-play" type="button" aria-label="پخش آهنگ">▶</button>
        <a class="song-page-link" aria-label="صفحه اختصاصی آهنگ">صفحه آهنگ ←</a>
      </div>`;
    row.querySelector("img").src = song.cover;
    row.querySelector(".song-info strong").textContent = song.title;
    row.querySelector(".song-play").addEventListener("click", () => playSong(realIndex));
    row.querySelector(".song-page-link").href = getSongUrl(song);
    row.querySelector(".song-page-link").addEventListener("click", event => {
      event.stopPropagation();
    });
    row.addEventListener("click", event => {
      if (!event.target.closest("button,a")) {
        location.href = getSongUrl(song);
      }
    });
    songList.appendChild(row);
  });
}
function playSong(index) {
  const song = songs[index];
  if (!song) return;
  if (currentSongIndex === index && !audio.paused) {
    audio.pause();
    return;
  }
  currentSongIndex = index;
  audio.src = song.file;
  document.getElementById("playerTitle").textContent = song.title;
  document.getElementById("playerCover").src = song.cover;
  audio.play().catch(() => {
    alert("فایل صوتی پیدا نشد. فایل MP3 را با نام درست داخل پوشه assets/music قرار بده.");
  });
}
function togglePlayback() {
  if (currentSongIndex === -1) {
    playSong(0);
  } else if (audio.paused) {
    audio.play().catch(() => alert("فایل صوتی در دسترس نیست."));
  } else {
    audio.pause();
  }
}
function nextSong() {
  if (!songs.length) return;
  playSong(currentSongIndex < 0 ? 0 : (currentSongIndex + 1) % songs.length);
}
function previousSong() {
  if (!songs.length) return;
  playSong(currentSongIndex < 0 ? 0 : (currentSongIndex - 1 + songs.length) % songs.length);
}
function updatePlayer() {
  playButton.textContent = audio.paused ? "▶" : "Ⅱ";
  document.getElementById("currentTime").textContent = formatTime(audio.currentTime);
  document.getElementById("duration").textContent = formatTime(audio.duration);
  document.getElementById("seekBar").value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
}
function loadSongPage() {
  const id = new URLSearchParams(location.search).get("song");
  if (!id) return;
  const song = songs.find(item => item.id === id);
  if (!song) return;
  document.title = `${song.title} | BARDIA`;
  document.querySelector("main").innerHTML = `
    <a class="back-link" href="./">← بازگشت به همه آهنگ‌ها</a>
    <section class="song-detail">
      <img src="${song.cover}" alt="کاور آهنگ" class="detail-cover">
      <div class="detail-copy">
        <span class="eyebrow">BARDIA SINGLE</span>
        <h1 id="detailTitle"></h1>
        <p>خواننده: بردیا</p>
        <p>تاریخ انتشار: ${song.date}</p>
        <button class="gold-link" id="detailPlay" type="button">▶ پخش آهنگ</button>
        <a class="download-link" href="${song.file}" download>⬇ دانلود آهنگ</a>
      </div>
    </section>
    <section class="about-section detail-about">
      <h2>درباره این آهنگ</h2>
      <p>این صفحه اختصاصی آهنگ «${song.title}» از بردیاست.</p>
    </section>
    <section class="about-section lyrics-section">
      <h2>متن آهنگ</h2>
      <p id="songLyrics" class="lyrics-text"></p>
    </section>`;
  document.getElementById("detailTitle").textContent = song.title;
  document.getElementById("songLyrics").textContent = song.lyrics || "متن این آهنگ هنوز ثبت نشده است.";
  document.getElementById("detailPlay").addEventListener("click", () => playSong(songs.indexOf(song)));
}

searchInput.addEventListener("input", renderSongs);
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderSongs();
  });
});
playButton.addEventListener("click", togglePlayback);
document.getElementById("nextButton").addEventListener("click", nextSong);
document.getElementById("previousButton").addEventListener("click", previousSong);
audio.addEventListener("play", updatePlayer);
audio.addEventListener("pause", updatePlayer);
audio.addEventListener("timeupdate", updatePlayer);
audio.addEventListener("loadedmetadata", updatePlayer);
audio.addEventListener("ended", nextSong);
document.getElementById("seekBar").addEventListener("input", event => {
  if (audio.duration) audio.currentTime = (Number(event.target.value) / 100) * audio.duration;
});

renderSongs();
loadSongPage();
