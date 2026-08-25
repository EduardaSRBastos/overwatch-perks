const ROLE_ORDER = ["tank", "damage", "support"];
const IMG_BASE = "https://owperks.com/_next/image?url=%2Fheroes-icons/";

const content = document.getElementById("content");
const noResults = document.getElementById("noResults");
const resultsStatus = document.getElementById("resultsStatus");
const heroCount = document.getElementById("heroCount");
const search = document.getElementById("search");
const filters = document.getElementById("filters");
const toTop = document.getElementById("toTop");

let heroes = [];
let currentRole = "all";
let currentQuery = "";

// Dynamic year
document.getElementById("year").textContent = new Date().getFullYear();

function perkCol(label, perk) {
  if (!perk) {
    return `
      <div class="perk-col">
        <div class="perk-label">${label}</div>
        <div class="perk-row"></div>
      </div>
    `;
  }

  const sideLabel = perk.side === "left" ? "Left branch" : "Right branch";

  const arrow =
    perk.side === "left"
      ? `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `
      : `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `;

  return `
    <div class="perk-col">
      <div class="perk-label">${label}</div>

      <div class="perk-row">
        <div class="badge ${perk.side}" role="img" aria-label="${sideLabel}">
          ${arrow}
        </div>

        <div class="perk-text">
          ${perk.text}
        </div>
      </div>
    </div>
  `;
}

function matches(hero, query) {
  if (!query) return true;

  const q = query.toLowerCase();

  return (
    hero.name.toLowerCase().includes(q) ||
    hero.minor?.text.toLowerCase().includes(q) ||
    hero.major?.text.toLowerCase().includes(q)
  );
}

function render() {
  content.innerHTML = "";
  let anyVisible = false;
  let visibleCount = 0;

  ROLE_ORDER.forEach((role) => {
    if (currentRole !== "all" && currentRole !== role) {
      return;
    }

    const group = heroes
      .filter((hero) => hero.role === role && matches(hero, currentQuery))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!group.length) return;

    anyVisible = true;
    visibleCount += group.length;

    const section = document.createElement("div");
    section.className = "role-section";

    section.innerHTML = `
      <div class="role-heading ${role}">
        <span class="swatch-dot" aria-hidden="true"></span>

        <h2>${group[0].roleName}</h2>

        <span style="opacity:.7;font-weight:600;" aria-hidden="true">
          · ${group.length}
        </span>
      </div>

      <div class="hero-grid">
        ${group
          .map(
            (hero) => `
              <div class="hero-card ${role}">

                <div class="hero-id">
                  <div class="role-bar ${role}" aria-hidden="true"></div>

                  <img
                    class="hero-portrait"
                    src="${IMG_BASE}${hero.img}.webp&w=64&q=75"
                    alt="${hero.name}"
                    width="50"
                    height="50"
                    loading="lazy"
                  >

                  <div class="hero-name">
                    ${hero.name}
                  </div>
                </div>

                ${perkCol("Minor Perk", hero.minor)}

                ${perkCol("Major Perk", hero.major)}

              </div>
            `,
          )
          .join("")}
      </div>
    `;

    content.appendChild(section);
  });

  noResults.style.display = anyVisible ? "none" : "block";

  resultsStatus.textContent = anyVisible
    ? `Showing ${visibleCount} of ${heroes.length} heroes`
    : "No heroes match that search.";

  document.querySelectorAll(".hero-portrait").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.visibility = "hidden";
    });
  });
}

document.querySelectorAll(".chip").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.remove("active");
      chip.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    currentRole = button.dataset.role;

    render();
  });
});

// Search
search.addEventListener("input", (e) => {
  currentQuery = e.target.value.trim();

  render();
});

// Back to top
window.addEventListener("scroll", () => {
  toTop.classList.toggle("visible", window.scrollY > 400);
});

toTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Load heroes.json
async function loadHeroes() {
  try {
    const response = await fetch("./assets/heroes.json");

    if (!response.ok) {
      throw new Error(`Failed to load heroes.json: ${response.status}`);
    }

    heroes = await response.json();

    if (!Array.isArray(heroes)) {
      throw new Error("heroes.json must contain an array");
    }

    heroCount.textContent = `${heroes.length} heroes`;

    render();
    
  } catch (error) {
    console.error("Failed to load heroes.json:", error);

    heroCount.textContent = "0 heroes";
    noResults.textContent = "Failed to load hero data.";
    noResults.style.display = "block";

    content.innerHTML = "";
  }
}

loadHeroes();