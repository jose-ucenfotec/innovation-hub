// El resultado queda en req.validado; un ZodError llega al manejador como 400.
export const validar = (esquemas) => (req, _res, next) => {
  req.validado = {};
  for (const parte of ['params', 'query', 'body']) {
    if (esquemas[parte]) req.validado[parte] = esquemas[parte].parse(req[parte] ?? {});
  }
  next();
};