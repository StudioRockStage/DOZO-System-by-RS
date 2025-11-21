/**
 * DOZO System Updates Worker
 * Service Worker syntax - serves binary files from R2 bucket
 */

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === '/' || url.pathname === '') {
    return new Response('DOZO R2 Updates Endpoint ✅', {
      headers: {
        'Content-Type': 'text/plain',
        'X-DOZO-Version': '1.0.0',
      },
    });
  }

  const objectKey = url.pathname.substring(1);
  try {
    const object = await env.DOZO_BUCKET.get(objectKey);
    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    const data = await object.arrayBuffer();
    const contentType = getContentType(objectKey);

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `attachment; filename="${getFileName(objectKey)}"`,
      },
    });
  } catch (e) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event.env));
});

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

function getFileName(path) {
  return path.split('/').pop() || 'download';
}
