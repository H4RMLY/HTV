import express from 'express';

const webRoot = './';
const app = express();
app.use(express.static(webRoot));

app.listen(8080);
