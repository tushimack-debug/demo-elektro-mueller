const root = document.documentElement;
root.classList.add("has-app");
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduce = motion.matches;
root.classList.toggle("reduce", reduce);
document.body.classList.add("no-webgl");
motion.addEventListener("change", () => {
  root.classList.toggle("reduce", motion.matches);
  document.querySelectorAll(".card").forEach(card => card.style.transform = "");
});
// Core navigation and privacy controls never depend on WebGL.
const cards = document.querySelectorAll(".card");
const fine = window.matchMedia("(pointer: fine)").matches && !reduce;
if (fine) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (motion.matches) { card.style.transform = ""; return; }
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      card.style.transform = "rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg)";
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

if (!reduce && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in");
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus();
  }
});

const mapBtn = document.querySelector("#map-load");
const mapRemove = document.querySelector("#map-remove");
const mapConsent = document.querySelector("#map-consent");
const mapContent = document.querySelector("#map-content");
mapBtn?.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.title = "Google Maps: Münchener Straße 47, Erlangen (Bestandsangabe, ungeprüft)";
  frame.referrerPolicy = "no-referrer";
  frame.src = "https://maps.google.com/maps?q=M%C3%BCnchener+Str.+47,+91054+Erlangen&hl=de&z=16&output=embed";
  mapContent.replaceChildren(frame);
  mapConsent.hidden = true; mapRemove.hidden = false; mapRemove.focus();
});
mapRemove?.addEventListener("click", () => {
  mapContent.replaceChildren(); mapConsent.hidden = false; mapRemove.hidden = true; mapBtn.focus();
});

const form = document.querySelector("#kontakt-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("telefon") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("nachricht") || "").trim();
    const status = document.querySelector("#form-status");
    if (!name || !message) {
      if (status) status.textContent = "Bitte Name und Nachricht ausfüllen.";
      return;
    }
    const body = ["Anfrage über den Demo-Entwurf", "", "Name: " + name, "Telefon: " + (phone || "–"), "E-Mail: " + (email || "–"), "", message].join("\n");
    if (status) status.textContent = "Das E-Mail-Programm wird geöffnet. Die Nachricht wurde noch nicht versendet; bitte dort prüfen und senden.";
    window.location.href = "mailto:elektro-mueller-gmbh@t-online.de?subject=" + encodeURIComponent("Anfrage von " + name) + "&body=" + encodeURIComponent(body);
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const animationToggle = document.querySelector("#animation-toggle");
let loaded = false;
animationToggle?.addEventListener("click", async () => {
  if (loaded) { window.dispatchEvent(new Event("stop-animation")); animationToggle.disabled = true; animationToggle.textContent = "Animation ausgeschaltet"; animationToggle.setAttribute("aria-pressed", "false"); return; }
  if (motion.matches) {
    document.querySelector("#animation-status").textContent = "Animation ist wegen Ihrer Einstellung für reduzierte Bewegung deaktiviert.";
    return;
  }
  loaded = true;
  try {
    await import("./scene.js");
    if (document.body.classList.contains("no-webgl")) throw new Error("WebGL unavailable");
    animationToggle.textContent = "Animation ausschalten";
    animationToggle.setAttribute("aria-pressed", "true");
  } catch {
    document.body.classList.add("no-webgl");
    document.querySelector("#animation-status").textContent = "3D ist hier nicht verfügbar. Alle Seitenfunktionen bleiben nutzbar.";
    loaded = false;
  }
});
document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = "noopener noreferrer");
