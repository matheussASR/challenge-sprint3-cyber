// src/index.js (ou onde inicializa o Express)
const express = require('express');
const helmet = require('helmet');
const app = express();

// 1) Remova banner do Express
app.disable('x-powered-by');

// 2) Cabeçalhos de segurança
app.use(helmet({
  // CSP bem básico (ajuste p/ sua app; pode quebrar inline scripts)
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"]
    }
  },
  referrerPolicy: { policy: "no-referrer" },
  frameguard: { action: 'deny' },        // X-Frame-Options: DENY
  // X-Content-Type-Options e X-DNS-Prefetch-Control etc já vêm por padrão
}));

// 3) HSTS (se servir por HTTPS em staging/produção)
/* app.use(
  helmet.hsts({
    maxAge: 15552000,          // 180 dias
    includeSubDomains: true,
    preload: true,
  })
); */

// 4) Cookies seguros (exemplo de resposta)
app.get('/set', (req, res) => {
  res.cookie('session', 'abc', {
    httpOnly: true,
    secure: true,              // exige HTTPS
    sameSite: 'lax'
  });
  res.send('cookie set');
});

// 5) (Opcional) forçar HTTPS atrás de proxy
/* app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (req.secure) return next();
  return res.redirect(301, `https://${req.headers.host}${req.url}`);
}); */

app.get('/', (req, res) => res.send('OK'));
app.listen(3000, '0.0.0.0', () => console.log('http://127.0.0.1:3000'));
