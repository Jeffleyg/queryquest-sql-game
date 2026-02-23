import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import missionsRouter from './routes/missions';
import queryRouter from './routes/query';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/missions', missionsRouter);
app.use('/api/query', queryRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`QueryQuest backend running on port ${PORT}`);
});

export default app;
