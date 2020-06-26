const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/web'));
app.use('/data', express.static(__dirname + '/data'));

app.listen(3000, () => console.log('App runs on port 3000!'));
