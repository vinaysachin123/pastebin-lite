const fetch = globalThis.fetch || (() => {
  try {
    return require('node-fetch');
  } catch (e) {
    throw new Error('fetch is not available; run on Node 18+ or install node-fetch');
  }
})();

(async () => {
  try {
    console.log('Posting test paste...');
    const post = await fetch('http://localhost:3000/api/paste', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: 'Hello from test (automated)' }),
    });

    console.log('POST status:', post.status);
    let body;
    try { body = await post.json(); } catch (e) { body = await post.text(); }
    console.log('POST body:', body);

    const id = body && body.id;
    if (!id) {
      console.error('No id returned from POST — cannot GET');
      process.exit(1);
    }

    console.log('Getting paste by id (singular route):', id);
    const get = await fetch(`http://localhost:3000/api/paste/${id}`);
    console.log('GET status:', get.status);
    try { console.log('GET body:', await get.json()); } catch (e) { console.log('GET body text:', await get.text()); }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
