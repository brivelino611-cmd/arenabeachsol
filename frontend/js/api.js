/**
 * ============================================================
 * CAMADA DE API — Frontend → Backend
 * ============================================================
 * O frontend NUNCA fala diretamente com o Google Sheets.
 * Toda reserva passa pelo backend (Node.js), que é quem detém
 * as credenciais da API do Google e faz a checagem final de
 * disponibilidade antes de gravar a reserva.
 *
 * Se o backend não estiver rodando (ex: durante o desenvolvimento
 * apenas do visual), a API entra em "modo demonstração" e simula
 * as respostas localmente, para que o site continue navegável.
 * ============================================================
 */

const ArenaAPI = (() => {
  // Ajuste para a URL do seu backend em produção.
  const BASE_URL = window.ARENA_API_BASE_URL || "/api";

  let demoMode = false;
  let demoOcupados = {}; // cache local só para o modo demonstração

  async function request(path, options = {}) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw Object.assign(new Error(body.message || "Erro na requisição"), {
          status: res.status,
          body,
        });
      }
      return await res.json();
    } catch (err) {
      // Sem backend disponível (ex: aberto localmente como arquivo estático)
      if (err instanceof TypeError) {
        demoMode = true;
        return null;
      }
      throw err;
    }
  }

  /**
   * Busca os horários já ocupados para uma data + serviço específicos.
   * Retorno esperado do backend: { ocupados: ["18:00", "21:00"] }
   */
  async function getDisponibilidade(dataISO, servicoId) {
    const result = await request(
      `/disponibilidade?data=${encodeURIComponent(dataISO)}&servico=${encodeURIComponent(servicoId)}`
    );
    if (result) return result;

    // ---- modo demonstração (sem backend) ----
    const key = `${dataISO}_${servicoId}`;
    if (!demoOcupados[key]) {
      // Gera pseudo-ocupação estável a partir da data, só para preview visual.
      const seed = Array.from(dataISO + servicoId).reduce((a, c) => a + c.charCodeAt(0), 0);
      demoOcupados[key] = seed % 3 === 0 ? ["18:00", "21:00"] : seed % 3 === 1 ? ["17:00"] : [];
    }
    return { ocupados: demoOcupados[key], demo: true };
  }

  /**
   * Busca a agenda pública do dia (sem dados pessoais) para a seção
   * "Agenda de hoje".
   * Retorno esperado: { agenda: [{ horario, status, modalidade }] }
   */
  async function getAgendaHoje() {
    const result = await request(`/agenda/hoje`);
    if (result) return result;

    // ---- modo demonstração ----
    const horarios = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
    const modalidades = ["Beach Tennis", "Futvôlei", "Vôlei"];
    const agenda = horarios.map((h, i) => ({
      horario: h,
      status: i % 3 === 1 ? "reservado" : "disponivel",
      modalidade: modalidades[i % modalidades.length],
    }));
    return { agenda, demo: true };
  }

  /**
   * Envia uma nova reserva. O backend deve reconferir a disponibilidade
   * ANTES de gravar no Google Sheets (proteção contra dupla reserva).
   * Retorno esperado em sucesso: { ok: true, reserva: {...} }
   * Retorno esperado em conflito: { ok: false, conflito: true }
   */
  async function criarReserva(payload) {
    const result = await request(`/reservas`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (result) return result;

    // ---- modo demonstração ----
    return {
      ok: true,
      demo: true,
      reserva: {
        id: `DEMO-${Date.now()}`,
        ...payload,
        status: "confirmada",
        criadaEm: new Date().toISOString(),
      },
    };
  }

  return { getDisponibilidade, getAgendaHoje, criarReserva, isDemoMode: () => demoMode };
})();
