/**
 * ============================================================
 * MAIN.JS — comportamento geral do site
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupNav();
  setupRevealOnScroll();
  renderQuadras();
  renderPatrocinadores();
  renderServicosExtras();
  renderHorarioFuncionamento();
  renderAgendaHoje();
  setupLocalizacao();
  setupContato();
});

function setYear() {
  const el = document.getElementById("ano-atual");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------- NAVEGAÇÃO ---------------- */
function setupNav() {
  const nav = document.getElementById("site-nav");
  const links = document.querySelectorAll("[data-nav-link]");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
      lastY = window.scrollY;
    },
    { passive: true }
  );
}

/* ---------------- REVEAL AO ROLAR ---------------- */
function setupRevealOnScroll() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = document.querySelectorAll("[data-reveal]");

  if (prefersReduced) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------------- QUADRAS ---------------- */
function renderQuadras() {
  const grid = document.getElementById("quadras-grid");
  if (!grid) return;

  grid.innerHTML = ARENA_CONFIG.quadras
    .map(
      (q, i) => `
      <article class="court-card" data-reveal style="transition-delay:${i * 80}ms">
        <div class="court-card__media">
          <img src="${q.imagem}" alt="Foto da ${q.nome}"
               onerror="this.closest('.court-card__media').classList.add('is-placeholder'); this.remove();">
          <div class="court-card__placeholder-label">Foto oficial em breve</div>
        </div>
        <div class="court-card__body">
          <h3>${q.nome}</h3>
          <p class="court-card__modalidades">${q.modalidades.join(" / ")}</p>
          <p class="court-card__desc">${q.descricao}</p>
          ${
            q.patrocinadoresIds && q.patrocinadoresIds.length
              ? `<div class="court-card__sponsors">
                  <span>Patrocinadores</span>
                  ${q.patrocinadoresIds
                    .map((id) => {
                      const p = ARENA_CONFIG.patrocinadores.find((s) => s.id === id);
                      return p ? `<span class="chip">${p.nome}</span>` : "";
                    })
                    .join("")}
                </div>`
              : ""
          }
        </div>
      </article>`
    )
    .join("");
}

/* ---------------- PATROCINADORES ---------------- */
function renderPatrocinadores() {
  const section = document.getElementById("patrocinadores");
  const grid = document.getElementById("patrocinadores-grid");
  if (!grid) return;

  if (!ARENA_CONFIG.patrocinadores.length) {
    grid.innerHTML = `
      <div class="sponsors-empty">
        <p>Em breve, os parceiros que fazem parte da Arena aparecerão aqui.</p>
      </div>`;
    return;
  }

  grid.innerHTML = ARENA_CONFIG.patrocinadores
    .map(
      (p) => `
      <a class="sponsor-card" href="${p.link || "#"}" ${p.link ? 'target="_blank" rel="noopener"' : "tabindex=\"-1\""}>
        <img src="${p.logo}" alt="Logo ${p.nome}" loading="lazy">
        <span>${p.nome}</span>
      </a>`
    )
    .join("");
}

/* ---------------- MAIS QUE ESPORTE ---------------- */
function renderServicosExtras() {
  const grid = document.getElementById("extras-grid");
  if (!grid) return;
  grid.innerHTML = ARENA_CONFIG.servicosExtras
    .map(
      (s, i) => `
      <div class="extra-card" data-reveal style="transition-delay:${i * 80}ms">
        <span class="extra-card__icon">${s.icone}</span>
        <span class="extra-card__nome">${s.nome}</span>
      </div>`
    )
    .join("");
}

/* ---------------- HORÁRIO DE FUNCIONAMENTO ---------------- */
function renderHorarioFuncionamento() {
  const list = document.getElementById("horario-funcionamento-list");
  if (!list) return;
  list.innerHTML = ARENA_CONFIG.horarioFuncionamento
    .map((h) => `<li><span>${h.dia}</span><span>${h.horario}</span></li>`)
    .join("");
}

/* ---------------- AGENDA DE HOJE ---------------- */
async function renderAgendaHoje() {
  const list = document.getElementById("agenda-hoje-list");
  if (!list) return;

  list.innerHTML = `<p class="booking-loading">Carregando agenda...</p>`;
  const { agenda } = await ArenaAPI.getAgendaHoje();

  list.innerHTML = agenda
    .map(
      (item) => `
      <li class="agenda-item agenda-item--${item.status}">
        <span class="agenda-item__hora">${item.horario}</span>
        <span class="agenda-item__bar"></span>
        <span class="agenda-item__modalidade">${item.modalidade}</span>
        <span class="agenda-item__status">${item.status === "reservado" ? "Reservado" : "Disponível"}</span>
      </li>`
    )
    .join("");
}

/* ---------------- LOCALIZAÇÃO ---------------- */
function setupLocalizacao() {
  const iframe = document.getElementById("mapa-arena");
  const link = document.getElementById("como-chegar");
  const endereco = document.getElementById("endereco-texto");

  if (iframe) iframe.src = ARENA_CONFIG.endereco.googleMapsEmbed;
  if (link) link.href = ARENA_CONFIG.endereco.googleMapsLink;
  if (endereco) endereco.textContent = ARENA_CONFIG.endereco.linha;
}

/* ---------------- CONTATO ---------------- */
function setupContato() {
  const whats = document.querySelectorAll("[data-whatsapp-link]");
  whats.forEach((el) => {
    el.href = `https://wa.me/${ARENA_CONFIG.whatsapp}`;
  });

  const tel = document.getElementById("contato-telefone");
  if (tel) {
    if (ARENA_CONFIG.telefone) {
      tel.textContent = ARENA_CONFIG.telefone;
      tel.href = `tel:${ARENA_CONFIG.telefone}`;
    } else {
      tel.closest("[data-contato-item]")?.remove();
    }
  }

  const insta = document.getElementById("contato-instagram");
  if (insta) {
    if (ARENA_CONFIG.instagram) {
      insta.href = ARENA_CONFIG.instagram;
    } else {
      insta.closest("[data-contato-item]")?.remove();
    }
  }
}
