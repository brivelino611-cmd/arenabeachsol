const express = require("express");
const controller = require("../controllers/bookingController");

const router = express.Router();

// GET /api/disponibilidade?data=2026-09-25&servico=1h
router.get("/disponibilidade", controller.disponibilidade);

// GET /api/agenda/hoje
router.get("/agenda/hoje", controller.agendaHoje);

// POST /api/reservas
router.post("/reservas", controller.criarReserva);

module.exports = router;
