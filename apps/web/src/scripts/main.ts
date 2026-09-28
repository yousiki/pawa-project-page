const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const saveData =
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData === true;
const autoplay = !(reducedMotion || saveData);

const play = (video: HTMLVideoElement): void => {
  video.play().catch(() => {
    // Autoplay can be refused, for example in low-power mode. The controls stay available.
  });
};

/** Players start when mostly visible and pause when scrolled away, which keeps many clips cheap. */
const visible = new WeakSet<HTMLVideoElement>();
const viewport = new IntersectionObserver(
  (entries) => {
    for (const { target, isIntersecting } of entries) {
      const video = target as HTMLVideoElement;
      if (isIntersecting) {
        visible.add(video);
        if (autoplay) {
          play(video);
        }
      } else {
        visible.delete(video);
        video.pause();
      }
    }
  },
  { threshold: 0.35 }
);

/** Posters load only when a player approaches the viewport, keeping the first load light. */
const nearby = new IntersectionObserver(
  (entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      const video = target as HTMLVideoElement;
      if (isIntersecting) {
        if (!video.poster) {
          video.poster = video.dataset.lazyPoster ?? "";
        }
        observer.unobserve(video);
      }
    }
  },
  { rootMargin: "800px 0px" }
);

for (const player of document.querySelectorAll<HTMLElement>("[data-player]")) {
  const video = player.querySelector("video");
  if (!video) {
    continue;
  }
  viewport.observe(video);
  nearby.observe(video);

  const frame = video.parentElement;
  const tabs = [...player.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      if (tab.getAttribute("aria-selected") === "true") {
        return;
      }
      for (const t of tabs) {
        t.setAttribute("aria-selected", String(t === tab));
      }
      const { src, poster, ratio } = tab.dataset;
      if (!src) {
        return;
      }
      if (frame && ratio) {
        frame.style.aspectRatio = ratio;
      }
      video.poster = poster ?? "";
      video.src = src;
      if (visible.has(video)) {
        play(video);
      }
    });
  }
}

// The hero loop is decorative. Respect reduced motion and data saving, and stop it off screen.
const hero = document.querySelector<HTMLVideoElement>("[data-hero]");
if (hero) {
  if (autoplay) {
    viewport.observe(hero);
  } else {
    hero.removeAttribute("autoplay");
    hero.pause();
  }
}

// Generic tab panels, used by the paper tables.
for (const group of document.querySelectorAll<HTMLElement>("[data-tabs]")) {
  const tabs = [...group.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      for (const t of tabs) {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        const panel = document.getElementById(
          t.getAttribute("aria-controls") ?? ""
        );
        if (panel) {
          panel.hidden = !selected;
        }
      }
    });
  }
}

// Floating navigation appears once the hero has scrolled away and tracks the current section.
const nav = document.querySelector<HTMLElement>("[data-nav]");
const heroSection = document.getElementById("top");
if (nav && heroSection) {
  new IntersectionObserver(([entry]) => {
    nav.toggleAttribute("data-visible", !entry?.isIntersecting);
  }).observe(heroSection);

  const links = new Map(
    [...nav.querySelectorAll<HTMLAnchorElement>("[data-nav-link]")].map((a) => [
      a.dataset.navLink,
      a,
    ])
  );
  const spy = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) {
          for (const [id, link] of links) {
            link.setAttribute("aria-current", String(id === target.id));
          }
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  for (const id of links.keys()) {
    const section = id ? document.getElementById(id) : null;
    if (section) {
      spy.observe(section);
    }
  }
}

// Figures open at full resolution in a native dialog.
const lightbox = document.querySelector<HTMLDialogElement>("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("img");
if (lightbox && lightboxImage) {
  for (const trigger of document.querySelectorAll<HTMLButtonElement>(
    "[data-zoom]"
  )) {
    trigger.addEventListener("click", () => {
      lightboxImage.src = trigger.dataset.zoom ?? "";
      lightboxImage.alt = trigger.dataset.zoomAlt ?? "";
      lightbox.showModal();
    });
  }
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === lightboxImage) {
      lightbox.close();
    }
  });
}

// BibTeX copy button.
const copy = document.querySelector<HTMLButtonElement>("[data-copy]");
const bibtex = document.querySelector("[data-bibtex]");
if (copy && bibtex) {
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bibtex.textContent ?? "");
      copy.toggleAttribute("data-copied", true);
      setTimeout(() => copy.toggleAttribute("data-copied", false), 1800);
    } catch {
      window.getSelection()?.selectAllChildren(bibtex);
    }
  });
}
