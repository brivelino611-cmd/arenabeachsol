/**
 * ============================================================
 * REGRAS DE NEGÓCIO — RESERVAS
 * ============================================================
 * Toda a proteção contra dupla reserva mora aqui: nunca confie
 * no estado mostrado no frontend. Antes de gravar qualquer
 * reserva, este módulo relê a planilha e confere se o horário
 * ainda está livre.
 * ============================================================
 */

const { randomUUID } = require("crypto");
const catalog = require("./catalog");
const sheets = require("../integrations/googleSheets");

// Trava simples em memória para reduzir corrida entre requisições
// simultâneas no mesmo processo, enquanto a escrita na planilha
// (fonte da verdade) é confirmada.
const locks = new Set();

function lockKey(dataISO, horario) {
  return `${dataISO}_${horario}`;
}

async function getDisponibilidade(dataISO, servicoId) {
  const servico = catalog.getServico(servicoId);
  if (!servico) {
    const err = new Error("Serviço inválido.");
    err.status = 400;
    throw err;
  }

  const reservasDoDia = await sheets.getReservasDoDia(dataISO);
  const ocupados = reservasDoDia.map((r) => r.horario);

  return { ocupados };
}

async function getAgendaHoje() {
  const hoje = new Date().toISOString().slice(0, 10);
  const reservas = await sheets.getReservasDoDia(hoje);

  // A agenda pública NUNCA deve expor dados pessoais do cliente.
  const agenda = reservas.map((r) => ({
    horario: r.horario,
    status: "reservado",
    modalidade: r.modalidade,
  }));

  return { agenda, data: hoje };
}

function validarPayload(payload) {
  const erros = [];
  if (!payload || typeof payload !== "object") erros.push("Corpo da requisição inválido.");

  const { data, horario, servicoId, modalidade, cliente } = payload || {};

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) erros.push("Data inválida.");
  if (!horario || !/^\d{2}:\d{2}$/.test(horario)) erros.push("Horário inválido.");
  if (!modalidade || !catalog.MODALIDADES.includes(modalidade)) erros.push("Modalidade inválida.");
  if (!cliente || !cliente.nome || !cliente.telefone) erros.push("Nome e telefone são obrigatórios.");

  const servico = catalog.getServico(servicoId);
  if (!servico) erros.push("Serviço inválido.");
  else {
    const horariosValidos = catalog.horariosValidosDoServico(servico);
    if (!horariosValidos.includes(horario)) erros.push("Horário fora da janela permitida para este serviço.");
  }

  if (erros.length) {
    const err = new Error(erros.join(" "));
    err.status = 400;
    throw err;
  }

  return servico;
}

async function criarReserva(payload) {
  const servico = validarPayload(payload);
  const { data, horario, modalidade, cliente } = payload;
  const key = lockKey(data, horario);

  if (locks.has(key)) {
    return { ok: false, conflito: true, message: "Este horário está sendo reservado por outra pessoa agora." };
  }
  locks.add(key);

  try {
    // ---- Revalidação final contra a planilha (fonte da verdade) ----
    const reservasDoDia = await sheets.getReservasDoDia(data);
    const jaOcupado = reservasDoDia.some((r) => r.horario === horario);

    if (jaOcupado) {
      return { ok: false, conflito: true, message: "Esse horário acabou de ser ocupado." };
    }

    const reserva = {
      id: randomUUID(),
      data,
      horario,
      modalidade,
      servicoNome: servico.nome,
      valor: servico.preco, // preço sempre vem do catálogo do servidor, nunca do cliente
      cliente: {
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email || "",
        observacao: cliente.observacao || "",
      },
      criadaEm: new Date().toISOString(),
      status: "confirmada",
    };

    await sheets.appendReserva(reserva);

    return { ok: true, reserva };
  } finally {
    locks.delete(key);
  }
}

module.exports = { getDisponibilidade, getAgendaHoje, criarReserva };
