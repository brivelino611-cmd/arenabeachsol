/**
 * ============================================================
 * CATÁLOGO DE SERVIÇOS — fonte da verdade no backend
 * ============================================================
 * Mantenha este arquivo em sincronia com
 * frontend/js/config.js (seção "servicos"). O backend nunca deve
 * confiar em preço ou horário enviado pelo cliente: ele sempre
 * revalida contra este catálogo antes de gravar uma reserva.
 *
 * Para alterar preços, horários e modalidades, edite este
 * arquivo E o frontend/js/config.js. Veja o README, seção 7.
 * ============================================================
 */

const SERVICOS = [
  {
    id: "1h",
    nome: "01 Hora",
    duracaoMin: 60,
    preco: 50.0,
    janelas: [{ inicio: "16:00", fim: "23:00" }],
  },
  {
    id: "1h-manha",
    nome: "01 Hora — Manhã",
    duracaoMin: 60,
    preco: 50.0,
    horariosFixos: ["05:00", "06:00"],
  },
  {
    id: "2h",
    nome: "02 Horas Seguidas",
    duracaoMin: 120,
    preco: 90.0,
    janelas: [{ inicio: "16:00", fim: "23:00" }],
  },
  {
    id: "2h-manha",
    nome: "02 Horas Seguidas — Manhã",
    duracaoMin: 120,
    preco: 90.0,
    horariosFixos: ["05:00"],
  },
  {
    id: "3h",
    nome: "03 Horas Seguidas",
    duracaoMin: 180,
    preco: 135.0,
    janelas: [{ inicio: "16:00", fim: "23:00" }],
  },
  {
    id: "4h",
    nome: "04 Horas Seguidas",
    duracaoMin: 240,
    preco: 160.0,
    janelas: [{ inicio: "16:00", fim: "23:00" }],
  },
];

const MODALIDADES = ["Beach Tennis", "Vôlei", "Futvôlei"];

function getServico(id) {
  return SERVICOS.find((s) => s.id === id) || null;
}

function horariosValidosDoServico(servico) {
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

module.exports = { SERVICOS, MODALIDADES, getServico, horariosValidosDoServico };
