const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  
  res.end(JSON.stringify({
    message: 'Servidor de teste funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  }));
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});
