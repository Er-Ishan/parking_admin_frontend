const next = require('next');
const http = require('http');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(process.env.PORT || 3000, err => {
    if (err) throw err;
    console.log('> Ready');
  });
});
