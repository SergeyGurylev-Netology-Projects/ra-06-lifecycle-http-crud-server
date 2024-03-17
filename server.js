const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const uuid = require('uuid');

const app = new Koa();

const cards = [];

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use((ctx, next) => {
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Headers', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');

  if (ctx.request.method !== 'OPTIONS') {
    next();
    return;
  }

  ctx.response.status = 204;
});

app.use((ctx, next) => {
  const path = ctx.request.URL.pathname;

  switch (path) {
    case '/notes':
      next();
      return;
    default:
      ctx.response.status = 404;
      ctx.response.body = 'method wasn\'t found';
  }
});

app.use((ctx) => {
  switch (ctx.request.method) {
    case 'GET':
      ctx.response.body = cards;
      return;
    case 'POST':
      createCard(ctx);
      return;
    case 'DELETE':
      deleteCard(ctx);
      return;
    default:
      ctx.response.status = 404;
      ctx.response.body = 'method wasn\'t found';
  }
});

function createCard(ctx) {
  const { content } = ctx.request.body;

  const card = {
    id: uuid.v4(),
    content: content,
  };

  cards.push(card);
  ctx.response.body = card;
}

function deleteCard(ctx) {
  const { id } = ctx.request.query;

  const index = cards.findIndex(t => t.id === id);

  if (index < 0) {
    setErrorStatus(ctx);
    return;
  }

  cards.splice(index, 1);

  ctx.response.body = { result: 'OK' };
}

function setErrorStatus(ctx) {
  ctx.response.status = 404;
  ctx.response.body = 'card wasn\'t found';
}

const server = http.createServer(app.callback());

const port = 7070;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log(`Server is listening to ${port}`);
});
