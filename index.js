// Dynamic year
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();
});

const ROLE_ORDER = ["tank", "damage", "support"];
const IMG_BASE = "https://owperks.com/_next/image?url=%2Fheroes-icons/";
const content = document.getElementById("content");
const noResults = document.getElementById("noResults");
const heroCount = document.getElementById("heroCount");

const heroes = Array.from(document.querySelectorAll("#heroes .hero")).map(
  (h) => {
    const minor = h.querySelector('.perk[data-type="minor"]');
    const major = h.querySelector('.perk[data-type="major"]');
    return {
      role: h.dataset.role,
      roleName: h.dataset.roleName,
      name: h.querySelector("strong").textContent.trim(),
      img: h.dataset.img,
      minor: minor
        ? { side: minor.dataset.side, text: minor.textContent.trim() }
        : null,
      major: major
        ? { side: major.dataset.side, text: major.textContent.trim() }
        : null,
    };
  },
);

heroCount.textContent = heroes.length + " heroes";

function perkCol(label, perk) {
  const col = document.createElement("div");
  col.className = "perk-col";

  const lab = document.createElement("div");
  lab.className = "perk-label";
  lab.textContent = label;
  col.appendChild(lab);

  const row = document.createElement("div");
  row.className = "perk-row";

  const badge = document.createElement("div");
  const txt = document.createElement("div");

  if (perk) {
    badge.className = "badge " + perk.side;
    badge.innerHTML =
      perk.side === "left"
        ? '<svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    txt.className = "perk-text";
    txt.textContent = perk.text;
  }

  row.appendChild(badge);
  row.appendChild(txt);
  col.appendChild(row);
  return col;
}

function render(filterRole, query) {
  content.innerHTML = "";
  let anyVisible = false;

  ROLE_ORDER.forEach((role) => {
    if (filterRole !== "all" && filterRole !== role) return;

    const group = heroes
      .filter((h) => h.role === role && matches(h, query))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (group.length === 0) return;

    anyVisible = true;

    const section = document.createElement("div");
    section.className = "role-section";

    const heading = document.createElement("div");
    heading.className = "role-heading " + role;
    heading.innerHTML = `<span class="swatch-dot"></span>${group[0].roleName} <span style="opacity:.55;font-weight:600;">· ${group.length}</span>`;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "hero-grid";

    group.forEach((hero) => {
      const card = document.createElement("div");

      // Add the role to the card
      card.className = `hero-card ${role}`;

      const id = document.createElement("div");
      id.className = "hero-id";

      id.innerHTML = `
    <div class="role-bar ${role}"></div>

    <img
      class="hero-portrait"
      src="${IMG_BASE}${hero.img}.webp&w=64&q=75"
      alt="${hero.name}"
      loading="lazy"
      onerror="this.style.visibility='hidden'"
    >

    <div class="hero-name">${hero.name}</div>
  `;

      card.appendChild(id);

      card.appendChild(perkCol("Minor Perk", hero.minor));

      card.appendChild(perkCol("Major Perk", hero.major));

      grid.appendChild(card);
    });

    section.appendChild(grid);
    content.appendChild(section);
  });

  noResults.style.display = anyVisible ? "none" : "block";
}

function matches(hero, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    hero.name.toLowerCase().includes(q) ||
    (hero.minor && hero.minor.text.toLowerCase().includes(q)) ||
    (hero.major && hero.major.text.toLowerCase().includes(q))
  );
}

let currentRole = "all";
let currentQuery = "";

document.getElementById("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  document
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  currentRole = btn.dataset.role;
  render(currentRole, currentQuery);
});

document.getElementById("search").addEventListener("input", (e) => {
  currentQuery = e.target.value.trim();
  render(currentRole, currentQuery);
});

render(currentRole, currentQuery);

const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  toTop.classList.toggle("visible", window.scrollY > 400);
});
toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
