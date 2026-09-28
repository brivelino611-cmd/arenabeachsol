/**
 * ============================================================
 * CONFIGURAÇÃO DA ARENA BEACH SOLONÓPOLE
 * ============================================================
 * Este arquivo concentra todos os dados que podem mudar com
 * frequência: preços, horários, quadras e patrocinadores.
 *
 * Para alterar preços, horários, modalidades, quadras ou
 * patrocinadores, edite APENAS este arquivo.
 * Veja o README.md, seção 7 e 8, para instruções detalhadas.
 * ============================================================
 */

const ARENA_CONFIG = {
  nome: "Arena Beach Solonópole",
  slogan: "O novo point da cidade!",
  cidade: "Solonópole - CE",

  // WhatsApp usado nos botões "Falar com a Arena" e nas mensagens
  // de compartilhamento. Formato: código do país + DDD + número, sem símbolos.
  whatsapp: "55889XXXXXXXX", // PLACEHOLDER — substituir pelo número oficial

  telefone: "", // PLACEHOLDER — preencher se houver telefone fixo
  instagram: "", // PLACEHOLDER — ex: "https://instagram.com/arenabeachsolonopole"

  endereco: {
    linha: "Endereço a definir, Solonópole - CE", // PLACEHOLDER
    // Substitua pelo link de "Compartilhar" do Google Maps do local real.
    googleMapsEmbed: "https://www.google.com/maps?q=Solon%C3%B3pole+CE&output=embed",
    googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Solon%C3%B3pole+CE",
  },

  // Horário de funcionamento — PLACEHOLDER até confirmação oficial da Arena
  horarioFuncionamento: [
    { dia: "Segunda-feira", horario: "A definir" },
    { dia: "Terça-feira", horario: "A definir" },
    { dia: "Quarta-feira", horario: "A definir" },
    { dia: "Quinta-feira", horario: "A definir" },
    { dia: "Sexta-feira", horario: "A definir" },
    { dia: "Sábado", horario: "A definir" },
    { dia: "Domingo", horario: "A definir" },
  ],

  modalidades: [
    { id: "beach-tennis", nome: "Beach Tennis", icone: "🎾" },
    { id: "volei", nome: "Vôlei", icone: "🏐" },
    { id: "futvolei", nome: "Futvôlei", icone: "⚽" },
  ],

  // Serviços/duração conforme informado pela Arena. NÃO alterar valores
  // sem confirmação — apenas os horários abaixo definem quando cada
  // serviço pode ser reservado.
  servicos: [
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
  ],

  // Patrocinadores — nenhum nome foi informado ainda.
  // Para adicionar, inclua um objeto { id, nome, logo, link } neste array.
  patrocinadores: [],

  // Serviços extras — apenas os que foram informados
  servicosExtras: [
    { icone: "🍽️", nome: "Restaurante" },
    { icone: "🍧", nome: "Açaí & Sorvetes" },
    { icone: "💪", nome: "Moda Fitness & Suplementos" },
  ],
};