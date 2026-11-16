/** Same-origin JSON API client shared by the browser shell. */
export async function api(path, body) {
  const response = await fetch(`/api/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(result.error), { status: response.status });
  }
  return result;
}
