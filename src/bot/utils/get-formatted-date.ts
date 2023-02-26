export const getFormattedDate = (date?: Date): string =>
  date ? date.toString() : new Date().toString();

export const getISODate = (date?: Date): string =>
  date ? date.toISOString() : new Date().toISOString();
