const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getClaims(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') {
    query.append('category', params.category);
  }
  if (params.status && params.status !== 'All') {
    // Use exact spec strings: "Unverified", "Verified True", "False", "Misleading"
    query.append('status', params.status);
  }
  const qs = query.toString();
  const url = `${API_BASE}/claims${qs ? `?${qs}` : ''}`;
  return handleResponse(await fetch(url));
}

export async function getClaim(id) {
  return handleResponse(await fetch(`${API_BASE}/claims/${id}`));
}

export async function createClaim(claimData) {
  // API uses camelCase: sourcePlatform, sourceLink
  return handleResponse(await fetch(`${API_BASE}/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: claimData.text,
      sourcePlatform: claimData.sourcePlatform,
      category: claimData.category,
      sourceLink: claimData.sourceLink || undefined,
    }),
  }));
}

export async function reviewClaim(id, reviewData) {
  // API uses camelCase: reviewerNote
  return handleResponse(await fetch(`${API_BASE}/claims/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: reviewData.status,
      reviewerNote: reviewData.reviewerNote,
    }),
  }));
}

export async function getHealth() {
  return handleResponse(await fetch(`${API_BASE}/health`));
}
