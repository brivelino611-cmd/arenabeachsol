const bookingService = require("../services/bookingService");

async function disponibilidade(req, res, next) {
  try {
    const { data, servico } = req.query;
    if (!data || !servico) {
      return res.status(400).json({ message: "Parâmetros 'data' e 'servico' são obrigatórios." });
    }
    const result = await bookingService.getDisponibilidade(data, servico);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function agendaHoje(req, res, next) {
  try {
    const result = await bookingService.getAgendaHoje();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function criarReserva(req, res, next) {
  try {
    const result = await bookingService.criarReserva(req.body);
    res.status(result.ok ? 201 : 409).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { disponibilidade, agendaHoje, criarReserva };
