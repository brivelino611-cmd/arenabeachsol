require("dotenv").config();

const express = require("express");
const cors = require("cors");

const bookingsRouter = require("./routes/bookings");
const sheets = require("./integrations/googleSheets");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", bookingsRouter);

// Tratador de erros central — nunca vaza detalhes sensíveis ao cliente
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Erro interno do servidor.",
  });
});

async function start() {
  try {
    await sheets.ensureSheetReady();
  } catch (err) {
    console.warn("[startup] Não foi possível preparar a planilha automaticamente:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Arena Beach Solonópole API rodando em http://localhost:${PORT}`);
  });
}

start();
