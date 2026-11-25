const header = document.querySelector(".evok-header");
const menu = document.querySelector(".menu-toggle");
const compactNavigation = matchMedia("(max-width: 1050px)");

function setMenuOpen(open) {
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  menu.querySelector("use").setAttribute("href", open ? "#icon-close" : "#icon-menu");
}

menu.hidden = false;
header.classList.add("has-menu-toggle");
menu.addEventListener("click", () => setMenuOpen(menu.getAttribute("aria-expanded") === "false"));
compactNavigation.addEventListener("change", () => setMenuOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (menu.getAttribute("aria-expanded") !== "true") return;
  if (!header.contains(event.target) || event.target.closest('.evok-nav a[href^="#"]')) {
    setMenuOpen(false);
  }
});

const video = document.querySelector(".hero-video");
const videoToggle = document.querySelector(".video-toggle");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function reflectVideoState() {
  const label = video.paused ? "Воспроизвести видео" : "Приостановить видео";
  videoToggle.setAttribute("aria-label", label);
  videoToggle.title = label;
  videoToggle.querySelector("use").setAttribute("href", video.paused ? "#icon-play" : "#icon-pause");
}

function playVideo() {
  if (!video.hasAttribute("src")) {
    video.src = video.dataset.src;
  }
  video.muted = true;
  video.play().catch(reflectVideoState);
}

videoToggle.hidden = false;
reflectVideoState();
video.addEventListener("play", reflectVideoState);
video.addEventListener("pause", reflectVideoState);
video.addEventListener("error", () => { videoToggle.hidden = true; });
videoToggle.addEventListener("click", () => {
  if (video.paused) {
    playVideo();
  } else {
    video.pause();
  }
});
reducedMotion.addEventListener("change", ({ matches }) => {
  if (matches) video.pause();
});
if (!reducedMotion.matches) playVideo();
