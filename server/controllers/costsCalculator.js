const costsRouter = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads/', storage: multer.memoryStorage() });
const calculateBudgetsAndCosts = require('../costsGenerator')
  .calculateBudgetsAndCosts;

costsRouter.post('/', upload.single('costs'), (req, res) => {
  let costs = {};

  if (req.file) {
    const fileData = req.file.buffer.toString();

    costs = calculateBudgetsAndCosts(fileData);
    return res.status(201).json(costs);
  }

  return res.status(403).send('Not authorized POST');
});

module.exports = costsRouter;
