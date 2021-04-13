const express = require('express');
const cors = require('cors');
const costsCalculatorRouter = require('./controllers/costsCalculator');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', costsCalculatorRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
