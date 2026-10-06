export async function readResponse(res) {
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    console.warn('FixitAI API returned a non-JSON response:', res.status, text.slice(0, 500))
    return { detail: `The server returned an unexpected response (${res.status}). Please try again.` }
  }
  try { return await res.json() } catch { return {} }
}
