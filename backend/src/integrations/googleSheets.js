/**
 * ============================================================
 * INTEGRAÇÃO COM GOOGLE SHEETS
 * ============================================================
 * Único módulo do sistema que fala diretamente com a API do
 * Google. Nunca importado pelo frontend — apenas pelo backend.
 *
 * Requer as variáveis de ambiente:
 *   GOOGLE_SHEETS_SPREADSHEET_ID
 *   GOOGLE_SHEETS_TAB_NAME
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *
 * Veja o README.md, seções 3 e 4, para o passo a passo de
 * criação da Service Account e compartilhamento da planilha.
 * ============================================================
 */

const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || "Reservas";

// Cabeçalho oficial da planilha — a primeira linha da aba deve ter exatamente estas colunas.
const COLUNAS = [
  "ID",
  "Data",
  "Horario",
  "Modalidade",
  "Servico",
  "Valor",
  "Nome",
  "Telefone",
  "Email",
  "Observacao",
  "CriadaEm",
  "Status",
];

let sheetsClientPromise = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Credenciais do Google não configuradas. Preencha GOOGLE_SERVICE_ACCOUNT_EMAIL e " +
        "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY no arquivo .env (veja o README, seção 3)."
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getClient() {
  if (!sheetsClientPromise) {
    const auth = getAuth();
    sheetsClientPromise = google.sheets({ version: "v4", auth });
  }
  return sheetsClientPromise;
}

/**
 * Garante que a planilha tenha a aba e o cabeçalho corretos.
 * Chame uma vez na inicialização do servidor.
 */
async function ensureSheetReady() {
  if (!SPREADSHEET_ID) {
    console.warn(
      "[googleSheets] GOOGLE_SHEETS_SPREADSHEET_ID não configurado — " +
        "as reservas não serão persistidas até isso ser corrigido."
    );
    return;
  }
  const sheets = await getClient();

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existe = meta.data.sheets.some((s) => s.properties.title === TAB_NAME);

  if (!existe) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: TAB_NAME } } }] },
    });
  }

  const primeiraLinha = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB_NAME}!A1:L1`,
  });

  if (!primeiraLinha.data.values) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [COLUNAS] },
    });
  }
}

/**
 * Retorna todas as reservas de uma data específica com status "confirmada".
 * dataISO no formato YYYY-MM-DD.
 */
async function getReservasDoDia(dataISO) {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB_NAME}!A2:L`,
  });
  const linhas = res.data.values || [];

  return linhas
    .map(rowToReserva)
    .filter((r) => r && r.data === dataISO && r.status === "confirmada");
}

/**
 * Adiciona uma nova linha de reserva na planilha.
 */
async function appendReserva(reserva) {
  const sheets = await getClient();
  const linha = [
    reserva.id,
    reserva.data,
    reserva.horario,
    reserva.modalidade,
    reserva.servicoNome,
    reserva.valor,
    reserva.cliente.nome,
    reserva.cliente.telefone,
    reserva.cliente.email || "",
    reserva.cliente.observacao || "",
    reserva.criadaEm,
    reserva.status,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB_NAME}!A:L`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [linha] },
  });
}

function rowToReserva(row) {
  if (!row || !row[0]) return null;
  const [id, data, horario, modalidade, servicoNome, valor, nome, telefone, email, observacao, criadaEm, status] = row;
  return {
    id,
    data,
    horario,
    modalidade,
    servicoNome,
    valor: Number(valor),
    cliente: { nome, telefone, email, observacao },
    criadaEm,
    status,
  };
}

module.exports = { ensureSheetReady, getReservasDoDia, appendReserva };
