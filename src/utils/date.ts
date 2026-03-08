export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-ES').format(date);
