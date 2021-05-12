export function queryBuilder(queryObject: Record<string, any>) {
  const entries = Object.entries(queryObject);
  let query = '';

  if (entries.length > 0) {
    query += '?';
  }

  entries.forEach(([key, value], index) => {
    query += `${key}=${value}`;

    if (index !== entries.length - 1) {
      query += '&';
    }
  });

  return query;
}
