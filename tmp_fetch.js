const fetch = global.fetch;
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@contacerta.com', senha: 'admin123' })
    });
    console.log('status', res.status);
    const txt = await res.text();
    console.log('body', txt);
  } catch (e) {
    console.error('err', e);
  }
})();
