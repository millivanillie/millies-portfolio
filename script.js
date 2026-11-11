// Small enhancements only. The site works fully without JavaScript.

// 1. Keep the footer year current
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// 2. Show the current section name in the side rail as you scroll
const railLabel = document.querySelector("[data-rail-section]");
const sections = document.querySelectorAll("[data-section]");

if (railLabel && sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          railLabel.textContent = entry.target.dataset.section;
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}

// 2b. Slim the sticky nav and add its bottom line once the page has scrolled
const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const setStuck = () => siteHeader.classList.toggle("is-stuck", window.scrollY > 8);
  window.addEventListener("scroll", setStuck, { passive: true });
  setStuck();
}

// 3. Photo gallery: filter chips + click-to-enlarge viewer
const gallery = document.querySelector(".gallery");
const viewer = document.querySelector(".viewer");

if (gallery) {
  const chips = gallery.querySelectorAll(".chip");
  const items = [...gallery.querySelectorAll(".gallery__item")];
  const status = gallery.querySelector("[data-gallery-status]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Show how many photos are in each filter
  chips.forEach((chip) => {
    const filter = chip.dataset.filter;
    const count = filter === "all" ? items.length : items.filter((i) => i.dataset.tag === filter).length;
    const span = document.createElement("span");
    span.className = "chip__count";
    span.textContent = count;
    chip.append(span);
  });

  const visibleItems = () => items.filter((i) => !i.hidden);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      items.forEach((item, n) => {
        const show = filter === "all" || item.dataset.tag === filter;
        item.hidden = !show;
        item.classList.remove("is-entering");
        if (show && !reduceMotion) {
          void item.offsetWidth; // restart the animation
          item.style.animationDelay = `${Math.min(n, 8) * 30}ms`;
          item.classList.add("is-entering");
        }
      });
      const shown = visibleItems().length;
      status.textContent = `Showing ${shown} ${shown === 1 ? "photo" : "photos"}`;
    });
  });

  // Label each photo button with its caption for screen readers
  items.forEach((item) => {
    const caption = item.querySelector(".gallery__caption")?.textContent.trim();
    item.querySelector(".gallery__open").setAttribute("aria-label", `Open photo: ${caption}`);
  });

  // Viewer
  if (viewer && typeof viewer.showModal === "function") {
    const media = viewer.querySelector("[data-viewer-media]");
    const captionEl = viewer.querySelector("[data-viewer-caption]");
    const countEl = viewer.querySelector("[data-viewer-count]");
    let current = 0;
    let opener = null;

    const show = (index) => {
      const list = visibleItems();
      current = (index + list.length) % list.length;
      const item = list[current];
      const source = item.querySelector("img, .ph");
      media.replaceChildren(source.cloneNode(true));
      captionEl.textContent = item.querySelector(".gallery__caption").textContent.trim();
      countEl.textContent = `${current + 1} of ${list.length}`;
    };

    items.forEach((item) => {
      item.querySelector(".gallery__open").addEventListener("click", (e) => {
        opener = e.currentTarget;
        show(visibleItems().indexOf(item));
        viewer.showModal();
      });
    });

    viewer.querySelector("[data-viewer-prev]").addEventListener("click", () => show(current - 1));
    viewer.querySelector("[data-viewer-next]").addEventListener("click", () => show(current + 1));
    viewer.querySelector("[data-viewer-close]").addEventListener("click", () => viewer.close());

    viewer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });

    // Click outside the photo to close
    viewer.addEventListener("click", (e) => {
      if (e.target === viewer) viewer.close();
    });

    // Swipe on phones
    let startX = null;
    media.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    media.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    viewer.addEventListener("close", () => opener?.focus());
  }
}

// 4. Typewriter effect on the intro title, with a blinking caret at the end.
//    The full sentence stays in the page for screen readers, search engines
//    and anyone without JavaScript; words are only hidden visually, so the
//    layout never jumps while it appears word by word.
const typeTitle = document.querySelector("[data-typewriter]");

if (typeTitle) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  typeTitle.setAttribute("aria-label", typeTitle.textContent.replace(/\s+/g, " ").trim());
  wrapLastWord(typeTitle.querySelector("a"));   // the changing word gets its own span (styled in CSS)
  const originalHTML = typeTitle.innerHTML.trim();

  // Once typing is done, put the original markup back (keeps the link underline
  // clean) and park the blinking caret at the end
  const finish = (caret) => {
    typeTitle.innerHTML = originalHTML;
    typeTitle.append(caret);
  };

  // Wrap every character in its own span, keeping links and other tags intact.
  // Images (your portrait) are typed too: they pop in when the typing reaches them.
  const walker = document.createTreeWalker(typeTitle, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (n.nodeType === 3 || n.tagName === "IMG" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const chars = [];
  textNodes.forEach((node, i) => {
    if (node.nodeType === 1) {
      node.classList.add("tw-char");
      chars.push(node);
      return;
    }
    let text = node.textContent.replace(/\s+/g, " ");
    if (i === 0) text = text.trimStart();
    if (i === textNodes.length - 1) text = text.trimEnd();
    const frag = document.createDocumentFragment();
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "tw-char";
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch;
      frag.append(span);
      chars.push(span);
    });
    node.replaceWith(frag);
  });

  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");

  if (reduceMotion) {
    caret.style.animation = "none";
    finish(caret);
  } else {
    caret.classList.add("is-typing");
    typeTitle.classList.add("is-typing");
    chars[0].before(caret);

    // Group the letters into words: a word ends at a space, and the portrait
    // counts as its own word
    const words = [];
    let current = [];
    chars.forEach((c) => {
      const isImg = c.tagName === "IMG";
      if (isImg && current.length) { words.push(current); current = []; }
      current.push(c);
      if (isImg || c.textContent === " ") { words.push(current); current = []; }
    });
    if (current.length) words.push(current);

    let i = 0;
    const typeNext = () => {
      const word = words[i];
      word.forEach((c) => c.classList.add("is-on"));
      word[word.length - 1].after(caret);
      i += 1;
      if (i >= words.length) {
        caret.classList.remove("is-typing");
        // wait for the last word to finish fading in before tidying up
        setTimeout(() => {
          finish(caret);
          // let the browser paint once, then swipe the highlighter in
          requestAnimationFrame(() => requestAnimationFrame(() => typeTitle.classList.remove("is-typing")));
          startWordCycle(caret);
        }, 350);
        return;
      }
      // A little human rhythm: longer pauses after punctuation and the photo
      const text = word.map((c) => c.textContent).join("").trim();
      const delay = word[0].tagName === "IMG" ? 240 : /[.,!?]$/.test(text) ? 220 : 95 + Math.random() * 25;   // even pace feels smoother
      setTimeout(typeNext, delay);
    };
    setTimeout(typeNext, 300);
  }
}

// 4b. Word cycle: once the intro is typed, the last word of the highlighted
//     phrase is backspaced and retyped through this list, then loops back.
//     Edit the list to change the words (the first should match the word in
//     your HTML). Screen readers keep hearing the original sentence.
const CYCLE_WORDS = ["simple", "intuitive", "understandable", "accessible", "seamless", "effortless", "approachable", "meaningful", "clear"];

// Put the last word of the highlighted link in <span class="tw-word">
function wrapLastWord(link) {
  if (!link) return null;
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  let lastText = null;
  while (walker.nextNode()) lastText = walker.currentNode;
  if (!lastText) return null;
  const match = lastText.textContent.match(/^([\s\S]*?)(\S+)(\s*)$/);
  if (!match) return null;
  lastText.textContent = match[1];
  const word = document.createElement("span");
  word.className = "tw-word";
  word.textContent = match[2];
  lastText.after(word);
  if (match[3]) word.after(match[3]);
  return word;
}

function startWordCycle(caret) {
  const link = typeTitle && typeTitle.querySelector("a");
  if (!link) return;

  const word = link.querySelector(".tw-word") || wrapLastWord(link);
  if (!word) return;
  word.after(caret);            // caret sits right after the changing word

  const HOLD = 2200;            // how long each word stays (ms)
  const DELETE_SPEED = 55;      // ms per letter when backspacing
  const TYPE_SPEED = 95;        // ms per letter when typing
  const GAP = 300;              // pause between deleting and typing

  // Long words can wrap onto a new line. Reserve the height of the tallest
  // version so the page below doesn't jump up and down as words change.
  const reserveHeight = () => {
    const current = word.textContent;
    typeTitle.style.minHeight = "";
    let tallest = 0;
    CYCLE_WORDS.forEach((w) => {
      word.textContent = w;
      tallest = Math.max(tallest, typeTitle.offsetHeight);
    });
    word.textContent = current;
    typeTitle.style.minHeight = tallest + "px";
  };
  reserveHeight();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reserveHeight, 150);
  });

  let index = Math.max(0, CYCLE_WORDS.indexOf(word.textContent));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    await wait(HOLD + 800);     // let the highlighter swipe in first
    for (;;) {
      caret.classList.add("is-typing");
      while (word.textContent.length) {
        word.textContent = word.textContent.slice(0, -1);
        await wait(DELETE_SPEED);
      }
      await wait(GAP);
      index = (index + 1) % CYCLE_WORDS.length;
      const next = CYCLE_WORDS[index];
      for (let n = 1; n <= next.length; n++) {
        word.textContent = next.slice(0, n);
        await wait(TYPE_SPEED + Math.random() * 30);
      }
      caret.classList.remove("is-typing");
      await wait(HOLD);
    }
  };
  run();
}

// 5. Case-study videos: play automatically when scrolled into view, pause when
//    scrolled away. Videos are muted (browsers only allow muted autoplay).
//    Visitors who prefer reduced motion get a Play button instead.
document.querySelectorAll("video[data-autoplay-on-scroll]").forEach((video) => {
  const stage = video.parentElement;
  const toggle = stage.querySelector("[data-video-toggle]");
  const label = stage.querySelector("[data-video-toggle-label]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pausedByVisitor = reduceMotion;

  video.muted = true; // required for autoplay in Chrome, Safari and Firefox

  const setLabel = () => {
    if (label) label.textContent = video.paused ? "Play video" : "Pause video";
  };
  video.addEventListener("play", setLabel);
  video.addEventListener("pause", setLabel);

  if (toggle) {
    toggle.hidden = false;
    setLabel();
    toggle.addEventListener("click", () => {
      if (video.paused) {
        pausedByVisitor = false;
        video.play().catch(() => {});
      } else {
        pausedByVisitor = true;
        video.pause();
      }
    });
  }

  if (!("IntersectionObserver" in window)) {
    video.controls = true;
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !pausedByVisitor) {
        video.play().catch(() => {
          // If the browser still refuses, show the built-in controls instead
          video.controls = true;
        });
      } else if (!entry.isIntersecting && !video.paused) {
        video.pause();
      }
    },
    { threshold: 0.5 } // start once half the video is on screen
  );
  observer.observe(video);
});

// 6. Count-up numbers: each [data-count] counts from 0 to its value when it
//    scrolls into view. The real number is in the HTML, so screen readers and
//    visitors without JavaScript always get it.
const counters = document.querySelectorAll("[data-count]");
if (counters.length && "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const run = (el, delay) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    el.setAttribute("aria-label", `${target}${suffix}`);
    el.textContent = `0${suffix}`;
    setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // fast start, gentle finish
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  };

  counters.forEach((el) => { el.textContent = `0${el.dataset.suffix || ""}`; });

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target.closest("ul, ol, div") || entry.target;
      const siblings = [...group.querySelectorAll("[data-count]")];
      run(entry.target, Math.max(siblings.indexOf(entry.target), 0) * 150);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => counterObserver.observe(el));
}

// 7. Before / after slider: follows the mouse while hovering (no click needed),
//    drags on touch screens, and works with arrow keys via the hidden range input.
document.querySelectorAll("[data-compare]").forEach((box) => {
  const range = box.querySelector(".compare__range");
  const hint = box.parentElement.querySelector(".compare__hint");
  const isTouchOnly = window.matchMedia("(hover: none)").matches;
  if (hint && isTouchOnly) hint.textContent = "Drag across the image to compare the current flow with the redesign.";

  const set = (percent) => {
    const p = Math.max(0, Math.min(100, percent));
    box.style.setProperty("--pos", `${p}%`);
    box.classList.toggle("is-near-left", p < 14);
    box.classList.toggle("is-near-right", p > 86);
    if (range) range.value = Math.round(p);
  };
  const fromPointer = (e) => {
    const r = box.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };

  // Mouse: just hovering moves it
  box.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" || dragging) fromPointer(e);
  });

  // Touch and pen: press and drag
  let dragging = false;
  box.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    dragging = true;
    fromPointer(e);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((type) =>
    box.addEventListener(type, () => { dragging = false; })
  );

  // Keyboard
  if (range) range.addEventListener("input", () => set(Number(range.value)));
  set(50);
});

// 8. Case study contents (tl;dr): highlight the section you're reading, and
//    show that section's subheadings underneath it (built from the page's h3s)
const toc = document.querySelector(".toc");
if (toc) {
  const links = [...toc.querySelectorAll('.toc__list > li > a[href^="#"]')];
  const targets = links.map((a) => {
    const el = document.getElementById(a.getAttribute("href").slice(1));
    return el ? el.closest("section") || el : null;
  });
  const narrow = window.matchMedia("(max-width: 1100px)");
  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Group every subheading under the section link that comes before it
  const subHeads = [...document.querySelectorAll(".cs-body h3.cs-sub__title, .cs-body h3.decision__title")];
  const groups = links.map(() => []);
  subHeads.forEach((h) => {
    let owner = -1;
    targets.forEach((t, i) => {
      if (t && (t === h || t.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)) owner = i;
    });
    if (owner < 0) return;
    if (!h.id) h.id = `${slug(links[owner].textContent)}-${slug(h.textContent)}`;
    groups[owner].push(h);
  });

  // Build a nested list under each section link
  const subLinks = links.map((a, i) => {
    if (!groups[i].length) return [];
    const wrap = document.createElement("div");
    wrap.className = "toc__subwrap";
    const ul = document.createElement("ul");
    ul.className = "toc__sub";
    const made = groups[i].map((h) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${h.id}`;
      link.textContent = h.textContent.trim();
      li.append(link);
      ul.append(li);
      return link;
    });
    wrap.append(ul);
    a.parentElement.append(wrap);
    return made;
  });

  let current = -1;
  let currentSub = null;
  let locked = null;
  let unlock;

  const update = () => {
    const line = window.innerHeight * 0.3;
    let index = 0;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= line) index = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) index = targets.length - 1;
    if (locked !== null) index = locked.section;

    // Which subheading inside the current section have we reached?
    let sub = null;
    groups[index].forEach((h, k) => { if (h.getBoundingClientRect().top <= line) sub = k; });
    if (locked !== null && locked.sub !== undefined) sub = locked.sub;

    if (index !== current) {
      current = index;
      links.forEach((a, i) => {
        const on = i === index;
        a.parentElement.classList.toggle("is-open", on);
        if (on) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
      if (narrow.matches) {
        const a = links[index];
        toc.scrollTo({ left: a.offsetLeft - toc.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" });
      }
      currentSub = null;
    }
    const key = `${index}:${sub}`;
    if (key !== currentSub) {
      currentSub = key;
      subLinks.forEach((list, i) => list.forEach((l, k) => {
        if (i === index && k === sub) l.setAttribute("aria-current", "location");
        else l.removeAttribute("aria-current");
      }));
    }
  };

  // Clicking highlights straight away while the page scrolls there
  const hold = (state) => {
    locked = state; current = -1; currentSub = null; update();
    clearTimeout(unlock);
    unlock = setTimeout(() => { locked = null; }, 900);
  };
  links.forEach((a, i) => a.addEventListener("click", () => hold({ section: i })));
  subLinks.forEach((list, i) => list.forEach((l, k) => l.addEventListener("click", () => hold({ section: i, sub: k }))));

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", () => { current = -1; currentSub = null; update(); });
  update();
}

// 9. Photography strip: previous / next buttons scroll it sideways
document.querySelectorAll(".photos").forEach((wrap) => {
  const track = wrap.querySelector(".photos__track");
  const prev = wrap.querySelector("[data-photos-prev]");
  const next = wrap.querySelector("[data-photos-next]");
  if (!track || !prev || !next) return;
  const step = () => track.clientWidth * 0.8;
  const sync = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  track.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  sync();
});

// 10. Scroll story: pin the stage and move each heading away to reveal the next
document.querySelectorAll("[data-scrolly]").forEach((box) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // keep the simple list
  const steps = [...box.querySelectorAll(".scrolly__step")];
  const shots = [...box.querySelectorAll(".scrolly__shot, .scrolly__mark")];
  const dots = [...box.querySelectorAll(".scrolly__dots span")];
  if (!steps.length) return;
  box.classList.add("is-live");
  let current = -1;

  const stage = box.querySelector(".scrolly__stage");
  const update = () => {
    const r = box.getBoundingClientRect();
    const pinTop = parseFloat(getComputedStyle(stage).top) || 0;
    // how far we've scrolled while the panel is pinned, as 0 → 1
    const travel = Math.max(box.offsetHeight - stage.offsetHeight, 1);
    const progress = Math.min(Math.max((pinTop - r.top) / travel, 0), 0.999);
    const index = Math.floor(progress * steps.length);
    if (index === current) return;
    current = index;
    const mark = (el, i) => {
      el.classList.toggle("is-current", i === index);
      el.classList.toggle("is-past", i < index);
    };
    steps.forEach(mark);
    dots.forEach(mark);
    shots.forEach((s) => mark(s, Number(s.dataset.step) - 1));
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", () => { current = -1; update(); });
  update();
});

// 11. Journey map: as you scroll through the stages, the matching stage and dot
//     on the pinned curve light up. Clicking a stage scrolls to it.
document.querySelectorAll("[data-journey]").forEach((map) => {
  const head = map.querySelector(".journey__head");
  const tabs = [...map.querySelectorAll(".journey__tab")];
  const panels = [...map.querySelectorAll(".journey__panel")];
  const dots = [...map.querySelectorAll(".journey__dot")];
  if (!panels.length) return;
  let current = -1;

  const update = () => {
    if (head) {
      // only cover the gap above the curve once it's stuck under the nav
      const stuckAt = parseFloat(getComputedStyle(head).top) || 0;
      head.classList.toggle("is-pinned", head.getBoundingClientRect().top <= stuckAt + 1);
    }
    const line = (head ? head.getBoundingClientRect().bottom : 0) + 60;
    let index = 0;
    panels.forEach((p, i) => { if (p.getBoundingClientRect().top <= line) index = i; });
    if (index === current) return;
    current = index;
    tabs.forEach((t, i) => {
      if (i === index) t.setAttribute("aria-current", "step");
      else t.removeAttribute("aria-current");
    });
    dots.forEach((d, i) => d.classList.toggle("is-current", i === index));
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", () => { current = -1; update(); });
  update();
});

// 12. Competitive analysis: fill each phone's feature chart from the table, then on
//     wider screens pin the row of phones and slide it sideways as you scroll down.
document.querySelectorAll("[data-hscroll]").forEach((wrap) => {
  const section = wrap.closest(".cs-sub") || document;
  const table = section.querySelector("[data-compete]");
  const cards = [...wrap.querySelectorAll(".rival")];
  const score = { yes: 2, partly: 1, no: 0 };
  const level = (cell) => {
    const r = cell && cell.querySelector(".rate");
    return r ? (r.className.match(/rate--(yes|partly|no)/) || [])[1] : null;
  };

  // build the chart next to each phone
  if (table) {
    const heads = [...table.querySelectorAll("thead th")];
    const col = (app) => heads.findIndex((th) => th.dataset.app === app);
    const ours = col("hiking-project");
    const rows = [...table.querySelectorAll("tbody tr")];
    cards.forEach((card) => {
      const box = card.querySelector("[data-rival-chart]");
      const c = col(card.dataset.app);
      if (!box || c < 0) return;
      const isUs = c === ours;
      const name = heads[c].textContent.trim();
      let better = 0;
      const body = rows.map((tr) => {
        const cells = tr.children;
        const feature = cells[0].textContent.trim();
        const mine = cells[c], theirs = cells[ours];
        if (!isUs && score[level(mine)] > score[level(theirs)]) better++;
        return `<tr><th scope="row">${feature}</th><td>${mine.innerHTML}</td>${isUs ? "" : `<td>${theirs.innerHTML}</td>`}</tr>`;
      }).join("");
      const head = `<thead><tr><th scope="col">Feature</th><th scope="col">${isUs ? "Rating" : name}</th>${isUs ? "" : "<th scope=\"col\">Hiking Project</th>"}</tr></thead>`;
      const sum = isUs ? "" :
        `<p class="rival__sum">Does better than Hiking Project on ${better} of ${rows.length}</p>`;
      box.innerHTML = `${sum}<table>${head}<tbody>${body}</tbody></table>`;
    });
  }

  // pinned sideways scroll
  const stage = wrap.querySelector(".hscroll__stage");
  const track = wrap.querySelector(".hscroll__track");
  const bar = wrap.querySelector(".hscroll__bar");
  const wide = window.matchMedia("(min-width: 721px) and (prefers-reduced-motion: no-preference)");
  let dist = 0;

  const measure = () => {
    if (!wide.matches) {
      wrap.classList.remove("is-live");
      wrap.style.height = "";
      stage.style.top = "";
      track.style.transform = "";
      return;
    }
    wrap.classList.add("is-live");
    // pin the phones in the middle of the screen (below the nav), not at the top
    stage.style.top = "";
    const navTop = parseFloat(getComputedStyle(stage).top) || 0;
    const centred = navTop + (window.innerHeight - navTop - stage.offsetHeight) / 2;
    stage.style.top = `${Math.max(navTop, centred)}px`;
    dist = Math.max(0, track.scrollWidth - stage.clientWidth);
    wrap.style.height = `${stage.offsetHeight + dist}px`;
    update();
  };
  const update = () => {
    if (!wrap.classList.contains("is-live")) return;
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const p = dist ? Math.min(1, Math.max(0, (top - wrap.getBoundingClientRect().top) / dist)) : 0;
    track.style.transform = `translateX(${-p * dist}px)`;
    if (bar) bar.style.transform = `scaleX(${p})`;
    const i = Math.round(p * (cards.length - 1));
    cards.forEach((c, k) => c.classList.toggle("is-current", k === i));
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", measure);
  wide.addEventListener("change", measure);
  window.addEventListener("load", measure);
  measure();
});

// 13. Hotspots: hovering (or tapping, or tabbing to) a + opens its pop-up and lights
//     up that part of the screen. Moving away, Escape, or tapping elsewhere closes it.
document.querySelectorAll("[data-hotspots]").forEach((box) => {
  const spots = [...box.querySelectorAll(".hot")];
  let closeTimer;
  const open = (spot) => {
    clearTimeout(closeTimer);
    spots.forEach((s) => {
      const on = s === spot;
      s.classList.toggle("is-open", on);
      s.querySelector(".hot__btn").setAttribute("aria-expanded", String(on));
    });
    if (spot) box.dataset.open = spot.dataset.hot;
    else delete box.dataset.open;
  };
  const closeSoon = () => { closeTimer = setTimeout(() => open(null), 180); };
  const canHover = window.matchMedia("(hover: hover)");

  spots.forEach((spot) => {
    const btn = spot.querySelector(".hot__btn");
    // mouse: open on hover, stay open while the pointer is on the + or its pop-up
    spot.addEventListener("mouseenter", () => { if (canHover.matches) open(spot); });
    spot.addEventListener("mouseleave", () => { if (canHover.matches) closeSoon(); });
    // keyboard (a tap also focuses the button, so leave taps to the click handler)
    let tapped = false;
    btn.addEventListener("pointerdown", () => { tapped = true; });
    btn.addEventListener("focus", () => { if (!tapped) open(spot); tapped = false; });
    spot.addEventListener("focusout", (e) => { if (!spot.contains(e.relatedTarget)) closeSoon(); });
    // touch: tap to open, tap again to close
    btn.addEventListener("click", () => {
      if (canHover.matches) return open(spot);
      open(spot.classList.contains("is-open") ? null : spot);
    });
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(null); });
  document.addEventListener("click", (e) => { if (!box.contains(e.target)) open(null); });
});

// 14. Smooth open/close for the "How I design" accordion: the card grows and
//     shrinks instead of jumping, and the text fades in as it opens.
document.querySelectorAll(".accordion details").forEach((item) => {
  const summary = item.querySelector("summary");
  const content = item.querySelector("p");
  if (!summary || !content) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.25, 0.8, 0.25, 1)";
  const DURATION = 420;
  let anim = null;

  const closedHeight = () => {
    const s = getComputedStyle(item);
    return summary.offsetHeight + parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth);
  };

  summary.addEventListener("click", (e) => {
    if (reduceMotion) return;          // let it open instantly
    e.preventDefault();
    if (anim) anim.cancel();
    const start = item.offsetHeight;

    if (!item.open) {
      item.open = true;
      const end = item.offsetHeight;
      anim = item.animate({ height: [start + "px", end + "px"] }, { duration: DURATION, easing: EASE });
      content.animate(
        { opacity: [0, 1], transform: ["translateY(-6px)", "none"] },
        { duration: DURATION, delay: 80, easing: EASE, fill: "backwards" }
      );
      anim.onfinish = () => { anim = null; };
    } else {
      item.classList.add("is-closing");
      anim = item.animate({ height: [start + "px", closedHeight() + "px"] }, { duration: DURATION - 60, easing: EASE });
      content.animate({ opacity: [1, 0] }, { duration: 200, easing: "ease-out", fill: "forwards" });
      anim.onfinish = () => {
        item.open = false;
        item.classList.remove("is-closing");
        content.getAnimations().forEach((a) => a.cancel());
        anim = null;
      };
    }
  });
});

