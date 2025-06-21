/**
 * Servidor HTTP simples para o Dataflow Portal.
 * Sem dependências externas, apenas módulos nativos do Node.js.
 * Controla login, sessão e entrega páginas estáticas.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const querystring = require('querystring');

const PORT = 3000;

// Dados de exemplo
const users = [
  { username: 'admin', password: 'admin', role: 'admin', clientId: null },
  { username: 'cliente1', password: '123', role: 'client', clientId: 'c1' },
];

const clients = [
  { id: 'c1', name: 'Cliente 1', dashboards: [
    { title: 'Vendas', url: 'https://app.powerbi.com/view?r=exemplo1' },
    { title: 'Financeiro', url: 'https://app.powerbi.com/view?r=exemplo2' },
  ]}
];

// Sessões em memória
const sessions = {};

function renderFile(res, filepath, contentType) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/session=([^;]+)/);
  if (match) return sessions[match[1]];
  return null;
}

function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const data = querystring.parse(body);
    const user = users.find(u => u.username === data.username && u.password === data.password);
    if (user) {
      const token = crypto.randomUUID();
      sessions[token] = user;
      res.writeHead(200, {
        'Set-Cookie': `session=${token}; Path=/; HttpOnly`,
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ ok: true }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Credenciais inválidas' }));
    }
  });
}

function handleLogout(req, res) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/session=([^;]+)/);
  if (match) delete sessions[match[1]];
  res.writeHead(302, { 'Set-Cookie': 'session=; Path=/; Max-Age=0', 'Location': '/' });
  res.end();
}

function handleApiDashboards(req, res, user) {
  if (!user) return unauthorized(res);
  const client = clients.find(c => c.id === user.clientId);
  const dashboards = client ? client.dashboards : [];
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dashboards));
}

function handleApiClients(req, res, user) {
  if (!user || user.role !== 'admin') return unauthorized(res);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(clients));
}

function unauthorized(res) {
  res.writeHead(401);
  res.end();
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const user = getSession(req);

  if (req.method === 'POST' && url.pathname === '/api/login') {
    return handleLogin(req, res);
  }
  if (url.pathname === '/logout') {
    return handleLogout(req, res);
  }
  if (url.pathname === '/api/dashboards') {
    return handleApiDashboards(req, res, user);
  }
  if (url.pathname === '/api/clients') {
    return handleApiClients(req, res, user);
  }

  // Proteção de rotas
  if (url.pathname === '/dashboard' && !user) {
    res.writeHead(302, { 'Location': '/' });
    return res.end();
  }
  if (url.pathname === '/admin' && (!user || user.role !== 'admin')) {
    res.writeHead(302, { 'Location': '/' });
    return res.end();
  }

  // Arquivos estáticos
  let filePath = '';
  let contentType = 'text/html';
  if (url.pathname === '/') filePath = path.join(__dirname, 'pages', 'login.html');
  else if (url.pathname === '/dashboard') filePath = path.join(__dirname, 'pages', 'dashboard.html');
  else if (url.pathname === '/admin') filePath = path.join(__dirname, 'pages', 'admin.html');
  else if (url.pathname.startsWith('/src/')) {
    filePath = path.join(__dirname, url.pathname);
    contentType = url.pathname.endsWith('.js') ? 'application/javascript' : 'text/css';
  } else {
    res.writeHead(404); return res.end('Not found');
  }
  renderFile(res, filePath, contentType);
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
