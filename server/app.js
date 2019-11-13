const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config.json');
const router = require('./router')(express);

const app = express();
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000 }));

// REST router
app.use('/', router);

const port = config.server_port;
app.listen(port || 8080, () => console.log(`Server listening on port ${port}`));