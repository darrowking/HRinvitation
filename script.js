const overlay = document.getElementById("invitationOverlay");
const siteShell = document.getElementById("siteShell");
const openInvitationBtn = document.getElementById("openInvitationBtn");
const revealElements = document.querySelectorAll(".reveal");
const countdownTarget = new Date("2026-04-20T09:00:00+05:30").getTime();
const form = document.getElementById("rsvpForm");
const formMessage = document.getElementById("formMessage");
const petalLayer = document.querySelector(".petal-layer");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const lightboxClose = document.getElementById("lightboxClose");
const mediaTriggers = document.querySelectorAll(".media-trigger");
const galleryVideos = document.querySelectorAll(".gallery-video");

let lightboxActiveVideo = null;

// Transition from the opening card into the full invitation.
function revealSite() {
  overlay.classList.add("is-hidden");
  siteShell.classList.add("is-visible");
  siteShell.setAttribute("aria-hidden", "false");
  document.body.style.overflowY = "auto";

  window.setTimeout(() => {
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  }, 150);
}

// Update the live wedding countdown every second.
function updateCountdown() {
  const now = Date.now();
  const diff = countdownTarget - now;

  if (diff <= 0) {
    setCountdownValues(0, 0, 0, 0);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  setCountdownValues(days, hours, minutes, seconds);
}

function setCountdownValues(days, hours, minutes, seconds) {
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

// Fade sections in as they enter the viewport.
function initRevealAnimations() {
  revealElements.forEach((element) => {
    const delay = element.dataset.revealDelay;

    if (delay) {
      element.style.setProperty("--reveal-delay", delay);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -70px 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}

// Apply soft parallax without clobbering existing transforms.

const rootStyle = document.documentElement.style;

function updatePhotoReveal() {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const reveal = Math.min(1, Math.max(0, (progress - 0.55) / 0.45));
  rootStyle.setProperty("--photo-reveal", reveal.toFixed(3));
}
function initParallax() {
  const parallaxElements = document.querySelectorAll("[data-parallax]");
  let ticking = false;

  function applyParallax() {
    const scrollY = window.scrollY;

    parallaxElements.forEach((element) => {
      const speed = Number(element.dataset.parallax) || 0.1;
      element.style.setProperty("--parallax-offset", `${scrollY * speed}px`);
    });

    ticking = false;
  }

  applyParallax();

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
}

// Generate decorative floating particles for a cinematic feel.
function initPetals() {
  const petalCount = window.innerWidth < 768 ? 14 : 24;

  for (let index = 0; index < petalCount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--size", `${Math.random() * 10 + 8}px`);
    petal.style.setProperty("--duration", `${Math.random() * 12 + 15}s`);
    petal.style.setProperty("--delay", `${Math.random() * -18}s`);
    petal.style.setProperty("--drift", `${Math.random() * 240 - 120}px`);
    petalLayer.appendChild(petal);
  }
}

function initVideoGallery() {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    },
    { threshold: 0.5 }
  );

  galleryVideos.forEach((video) => {
    videoObserver.observe(video);
  });
}

// Reuse a shared lightbox for images and videos.
function openLightbox(type, src, title) {
  lightboxContent.innerHTML = "";

  if (type === "image") {
    const image = document.createElement("img");
    image.src = src;
    image.alt = title;
    image.loading = "eager";
    lightboxContent.appendChild(image);
  } else {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    lightboxContent.appendChild(video);
    lightboxActiveVideo = video;
  }

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (lightboxActiveVideo) {
    lightboxActiveVideo.pause();
    lightboxActiveVideo = null;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxContent.innerHTML = "";

  if (!siteShell.classList.contains("is-visible")) {
    document.body.style.overflow = "hidden";
    return;
  }

  document.body.style.overflowY = "auto";
}

function initMediaTriggers() {
  mediaTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox(
        trigger.dataset.type,
        trigger.dataset.src,
        trigger.dataset.title || "Wedding media"
      );
    });
  });
}

function initForm() {
  if (!form) {
    return;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const attendee = data.get("name");
    const response = data.get("attendance");

    if (formMessage) {
      formMessage.textContent =
      response === "Yes"
        ? `Thank you, ${attendee}. Your presence means a lot to us.`
        : `Thank you, ${attendee}. We appreciate your response.`;

      }
    form.reset();
  });
}

openInvitationBtn.addEventListener("click", revealSite);
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

document.body.style.overflow = "hidden";
updateCountdown();
window.setInterval(updateCountdown, 1000);
initRevealAnimations();
initParallax();
updatePhotoReveal();
window.addEventListener("scroll", updatePhotoReveal, { passive: true });
window.addEventListener("resize", updatePhotoReveal);
initPetals();
initVideoGallery();
initMediaTriggers();
initForm();



// Legacy package accordion
const legacyToggle = document.querySelector(".legacy-toggle");
const legacyContent = document.getElementById("legacyContent");

if (legacyToggle && legacyContent) {
  legacyToggle.addEventListener("click", () => {
    const isOpen = legacyToggle.getAttribute("aria-expanded") === "true";
    legacyToggle.setAttribute("aria-expanded", String(!isOpen));
    legacyContent.hidden = isOpen;
  });
}

