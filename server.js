/* Servidor de desenvolvimento → npm run dev */
const { createServer } = require('./lib/server');

const PORT = Number(process.env.PORT) || 5173;

createServer()
  .on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`A porta ${PORT} já está em uso (talvez o site já esteja aberto em http://localhost:${PORT}).\nUse outra porta: PORT=${PORT + 1} npm run dev`);
      process.exit(1);
    }
    throw err;
  })
  .listen(PORT, () => console.log(`São José de Ribamar → http://localhost:${PORT}`));

process.on('unhandledRejection', err => { console.error('Rejeição não tratada:', err); });
