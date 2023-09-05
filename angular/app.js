const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const { getImagePaths } = require('./generate-img-paths');

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'src', 'assets', 'img')));

app.get('/api/images', (req, res) => {
  const images = getImagePaths();
  res.json(images);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
