import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from BFF!' });
});

app.listen(PORT, () => {
  console.log(`BFF server is running at http://localhost:${PORT}`);
});
