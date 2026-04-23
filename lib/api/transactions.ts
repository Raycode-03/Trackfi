export async function fetchTransactions(page = 1, period = "30") {
  const params = new URLSearchParams({
    page: String(page),
    period,
  });
  const res = await fetch(`/api/transactions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json(); 
}

 
export async function fetchTransactionStats(period = "30") {
  const res = await fetch(`/api/transactions/stats?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch transaction stats");
  return res.json();
}

export async function createTransaction(data: unknown) {
  // TODO: wire to /api/transactions when backend is ready
  console.warn('createTransaction: not implemented', data)
  return null
}
 
export async function deleteTransaction(id: string) {
  // TODO: wire to /api/transactions/[id] when backend is ready
  console.warn('deleteTransaction: not implemented', id)
  return null
}
 
 