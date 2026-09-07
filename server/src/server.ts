import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import verifyRouter from './routes/verify';
import healthRouter from './routes/health';
import historyRouter from './routes/history';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '50kb' }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many requests' },
  })
);

app.use('/health', healthRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/history', historyRouter);

app.listen(PORT, () => {
  console.log(`TrustMesh server running on port ${PORT}`);
});
