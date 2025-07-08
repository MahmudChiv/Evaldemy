require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth.js');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/protected', require('./middleware/verifyToken'), (req, res) => {
  res.json({ message: `Hello ${req.user.id}, this is protected!` });
});

app.listen(5000, () => console.log("Server stared on http://loalhost:5000"));
