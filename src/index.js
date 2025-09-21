const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('OK'));

app.get('/search', (req, res) => {
  // endpoint propositalmente “ruim” p/ ZAP detectar XSS refletido
  const q = req.query.q || '';
  res.send(`<h1>Busca</h1><div>Você buscou: ${q}</div>`);
});

app.listen(3000, () => console.log('http://127.0.0.1:3000'));
