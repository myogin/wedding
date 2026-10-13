/** GET JSON dari API halaman ini, tanpa cache. Status selain 2xx menjadi galat. */
export async function ambilJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}
