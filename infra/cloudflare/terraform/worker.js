// MIME helper
function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    dmg: 'application/x-apple-diskimage',
    pkg: 'application/x-installer',
    zip: 'application/zip',
    exe: 'application/x-msdownload',
    json: 'application/json',
    txt: 'text/plain',
    md: 'text/markdown',
    sha256: 'text/plain',
    sig: 'application/pgp-signature',
  };
  return map[ext] || 'application/octet-stream';
}

// Register handler with respondWith (Service Worker format with proper env access)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  const key = url.pathname.slice(1); // remove leading slash

  // Root check
  if (!key || key === '') {
    return new Response('DOZO Updates Ready ✅', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Fetch from R2 - access env from global scope
  try {
    const object = await DOZO_BUCKET.get(key);
    if (!object) {
      return new Response(`404 - File Not Found: ${key}`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Stream file from R2
    const contentType = getContentType(key);

    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
