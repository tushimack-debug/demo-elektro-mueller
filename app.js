const root = document.documentElement;
root.classList.add("has-app");
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduce = motion.matches;
root.classList.toggle("reduce", reduce);
motion.addEventListener("change", () => root.classList.toggle("reduce", motion.matches));
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
  frame.src = "https://www.google.com/maps?q=M%C3%BCnchener+Str.+47,+91054+Erlangen&hl=de&z=16&output=embed";
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

document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = "noopener noreferrer");
