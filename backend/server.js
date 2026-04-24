const express = require('express');
const cors = require('cors');
const path = require('path');
const bfhlRoutes = require('./routes/bfhl');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/bfhl', bfhlRoutes);

// Statically serve the frontend so the UI works live on Heroku!
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
