/**
 * ============================================================
 * SISTEMA DE RESERVA — Arena Beach Solonópole
 * ============================================================
 */

const Booking = (() => {
  const state = {
    step: 1,
    modalidade: null,
    dataISO: null,
    servico: null,
    horario: null,
    cliente: { nome: "", telefone: "", email: "", observacao: "" },
  };

  const els = {};

  function fmtBRL(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function fmtDataBR(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function init() {
    els.root = document.getElementById("reservar");
    if (!els.root) return;

    els.steps = els.root.querySelectorAll("[data-step]");
    els.modalidadeGrid = document.getElementById("booking-modalidades");
    els.dataInput = document.getElementById("booking-data");
    els.servicoGrid = document.getElementById("booking-servicos");
    els.horarioGrid = document.getElementById("booking-horarios");
    els.horarioAviso = document.getElementById("booking-horario-aviso");
    els.resumo = document.getElementById("booking-resumo");
    els.form = document.getElementById("booking-form");
    els.sucesso = document.getElementById("booking-sucesso");
    els.progress = document.querySelectorAll(".booking-progress__item");

    renderModalidades();
    setupDataInput();
    renderServicos();
    setupForm();
    goToStep(1);

    els.root.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(Number(btn.dataset.goto)));
    });
  }

  function renderModalidades() {
    els.modalidadeGrid.innerHTML = ARENA_CONFIG.modalidades
      .map(
        (m) => `
        <button class="option-card" type="button" data-modalidade="${m.id}">
          <span class="option-card__icon">${m.icone}</span>
          <span class="option-card__label">${m.nome}</span>
        </button>`
      )
      .join("");

    els.modalidadeGrid.querySelectorAll("[data-modalidade]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.modalidade = ARENA_CONFIG.modalidades.find((m) => m.id === btn.dataset.modalidade);
        els.modalidadeGrid
          .querySelectorAll(".option-card")
          .forEach((c) => c.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        goToStep(2);
      });
    });
  }

  function setupDataInput() {
    const today = new Date();
    const min = today.toISOString().slice(0, 10);
    els.dataInput.min = min;
    els.dataInput.value = min;
    state.dataISO = min;

    els.dataInput.addEventListener("change", () => {
      state.dataISO = els.dataInput.value;
    });

    document.getElementById("booking-data-confirmar").addEventListener("click", () => {
      if (!els.dataInput.value) return;
      state.dataISO = els.dataInput.value;
      goToStep(3);
    });
  }

  function renderServicos() {
    els.servicoGrid.innerHTML = ARENA_CONFIG.servicos
      .map(
        (s) => `
        <button class="service-card" type="button" data-servico="${s.id}">
          <span class="service-card__nome">${s.nome}</span>
          <span class="service-card__preco">${fmtBRL(s.preco)}</span>
        </button>`
      )
      .join("");

    els.servicoGrid.querySelectorAll("[data-servico]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.servico = ARENA_CONFIG.servicos.find((s) => s.id === btn.dataset.servico);
        els.servicoGrid
          .querySelectorAll(".service-card")
          .forEach((c) => c.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        goToStep(4);
        renderHorarios();
      });
    });
  }

  function gerarHorariosDoServico(servico) {
    if (servico.horariosFixos) return servico.horariosFixos.slice();
    const horarios = [];
    servico.janelas.forEach(({ inicio, fim }) => {
      let [h] = inicio.split(":").map(Number);
      const [hFim] = fim.split(":").map(Number);
      while (h <= hFim) {
        horarios.push(`${String(h).padStart(2, "0")}:00`);
        h += 1;
      }
    });
    return horarios;
  }

  async function renderHorarios() {
    els.horarioGrid.innerHTML = `<p class="booking-loading">Carregando horários...</p>`;
    els.horarioAviso.hidden = true;

    const todos = gerarHorariosDoServico(state.servico);
    const disponibilidade = await ArenaAPI.getDisponibilidade(state.dataISO, state.servico.id);
    const ocupados = new Set(disponibilidade.ocupados || []);

    els.horarioGrid.innerHTML = todos
      .map((h) => {
        const ocupado = ocupados.has(h);
        return `
        <button class="time-slot ${ocupado ? "is-occupied" : "is-available"}"
                type="button" data-horario="${h}" ${ocupado ? "disabled" : ""}>
          <span class="time-slot__hora">${h}</span>
          <span class="time-slot__status">${ocupado ? "Ocupado" : "Disponível"}</span>
        </button>`;
      })
      .join("");

    els.horarioGrid.querySelectorAll("[data-horario]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.horario = btn.dataset.horario;
        els.horarioGrid
          .querySelectorAll(".time-slot")
          .forEach((c) => c.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        goToStep(5);
        renderResumo();
      });
    });
  }

  function renderResumo() {
    els.resumo.innerHTML = `
      <dl class="summary-list">
        <div><dt>Modalidade</dt><dd>${state.modalidade.icone} ${state.modalidade.nome}</dd></div>
        <div><dt>Data</dt><dd>${fmtDataBR(state.dataISO)}</dd></div>
        <div><dt>Horário</dt><dd>${state.horario}</dd></div>
        <div><dt>Duração/Serviço</dt><dd>${state.servico.nome}</dd></div>
        <div><dt>Valor</dt><dd>${fmtBRL(state.servico.preco)}</dd></div>
      </dl>`;
  }

  function setupForm() {
    els.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(els.form);
      state.cliente = {
        nome: data.get("nome").trim(),
        telefone: data.get("telefone").trim(),
        email: (data.get("email") || "").trim(),
        observacao: (data.get("observacao") || "").trim(),
      };

      const btn = els.form.querySelector("[type=submit]");
      btn.disabled = true;
      btn.textContent = "Confirmando...";

      try {
        const payload = {
          modalidade: state.modalidade.nome,
          data: state.dataISO,
          horario: state.horario,
          servicoId: state.servico.id,
          servicoNome: state.servico.nome,
          valor: state.servico.preco,
          cliente: state.cliente,
        };
        const result = await ArenaAPI.criarReserva(payload);

        if (result.ok) {
          mostrarSucesso(result.reserva);
        } else if (result.conflito) {
          els.horarioAviso.hidden = false;
          els.horarioAviso.textContent =
            "Ih, esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.";
          goToStep(4);
          renderHorarios();
        } else {
          throw new Error(result.message || "Não foi possível confirmar a reserva.");
        }
      } catch (err) {
        alert(err.message || "Erro ao confirmar a reserva. Tente novamente.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Confirmar reserva";
      }
    });
  }

  function mostrarSucesso(reserva) {
    els.steps.forEach((s) => s.classList.remove("is-active"));
    els.sucesso.classList.add("is-active");

    const whats = ARENA_CONFIG.whatsapp;
    const msg = encodeURIComponent(
      `Olá! Acabei de reservar na Arena Beach Solonópole 🏖️\n` +
        `Modalidade: ${state.modalidade.nome}\n` +
        `Data: ${fmtDataBR(state.dataISO)}\n` +
        `Horário: ${state.horario}\n` +
        `Serviço: ${state.servico.nome}\n` +
        `Valor: ${fmtBRL(state.servico.preco)}\n` +
        `Nome: ${state.cliente.nome}`
    );

    document.getElementById("sucesso-detalhes").innerHTML = `
      <dl class="summary-list">
        <div><dt>Modalidade</dt><dd>${state.modalidade.icone} ${state.modalidade.nome}</dd></div>
        <div><dt>Data</dt><dd>${fmtDataBR(state.dataISO)}</dd></div>
        <div><dt>Horário</dt><dd>${state.horario}</dd></div>
        <div><dt>Duração</dt><dd>${state.servico.nome}</dd></div>
        <div><dt>Valor</dt><dd>${fmtBRL(state.servico.preco)}</dd></div>
        <div><dt>Nome</dt><dd>${state.cliente.nome}</dd></div>
      </dl>`;

    const whatsBtn = document.getElementById("sucesso-whatsapp");
    whatsBtn.href = `https://wa.me/${whats}?text=${msg}`;

    document.getElementById("sucesso-calendario").addEventListener("click", () => {
      adicionarAoCalendario(reserva);
    });

    document.getElementById("sucesso-compartilhar").addEventListener("click", async () => {
      const texto = decodeURIComponent(msg);
      if (navigator.share) {
        try {
          await navigator.share({ title: "Minha reserva na Arena Beach Solonópole", text: texto });
        } catch (_) {
          /* usuário cancelou */
        }
      } else {
        window.open(`https://wa.me/${whats}?text=${msg}`, "_blank");
      }
    });
  }

  function adicionarAoCalendario(reserva) {
    const [ano, mes, dia] = state.dataISO.split("-").map(Number);
    const [hora, min] = state.horario.split(":").map(Number);
    const inicio = new Date(ano, mes - 1, dia, hora, min);
    const fim = new Date(inicio.getTime() + (state.servico.duracaoMin || 60) * 60000);

    const toICSDate = (d) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${state.modalidade.nome} - Arena Beach Solonópole`,
      `DTSTART:${toICSDate(inicio)}`,
      `DTEND:${toICSDate(fim)}`,
      `DESCRIPTION:Reserva na Arena Beach Solonópole - ${state.servico.nome}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reserva-arena-beach.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  function goToStep(n) {
    state.step = n;
    els.steps.forEach((s) => {
      s.classList.toggle("is-active", Number(s.dataset.step) === n);
    });
    els.progress.forEach((p, i) => {
      p.classList.toggle("is-done", i + 1 < n);
      p.classList.toggle("is-active", i + 1 === n);
    });
    els.root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return { init, scrollAndStart: () => goToStep(1) };
})();

document.addEventListener("DOMContentLoaded", Booking.init);
