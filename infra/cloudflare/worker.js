/**
 * DOZO System Updates Worker
 * Serves binary files from R2 bucket with proper headers
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Root path - return status message
    if (url.pathname === '/' || url.pathname === '') {
      return new Response('DOZO R2 Updates Endpoint ✅', {
        headers: {
          'Content-Type': 'text/plain',
          'X-DOZO-Version': '1.0.0',
        },
      });
    }

    // Get file from R2 bucket
    const objectKey = url.pathname.substring(1); // Remove leading slash

    try {
      const object = await env.DOZO_BUCKET.get(objectKey);

      if (object === null) {
        return new Response('File not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }

      // Determine content type based on file extension
      const contentType = getContentType(objectKey);

      // Get object as array buffer for binary data
      const objectBody = await object.arrayBuffer();

      // Return file with appropriate headers
      return new Response(objectBody, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': object.size.toString(),
          'Cache-Control': 'public, max-age=3600',
          'X-DOZO-File': objectKey,
          'X-DOZO-Etag': object.httpEtag || '',
          'Content-Disposition': `attachment; filename="${getFileName(objectKey)}"`,
        },
      });
    } catch (error) {
      console.error('Error fetching from R2:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};

/**
 * Determine content type based on file extension
 */
function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();

  const contentTypes = {
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

  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Extract filename from path
 */
function getFileName(path) {
  return path.split('/').pop() || 'download';
}
