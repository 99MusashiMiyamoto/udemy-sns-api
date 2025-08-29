const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();
const authRoute = require('./routers/auth');
const postsRoute = require('./routers/posts');
const userRoute = require('./routers/users');
const cors = require('cors');

// デプロイ
const PORT = process.env.PORT || 10000;

// 許可するオリジン
const allowedOrigins = [
  'https://udemy-sns-client-eta.vercel.app',
  'https://udemy-sns-client-99b3xv6zs-mmiyamotos-projects.vercel.app',
  'http://localhost:3000'
];

// 動的CORS判定（VercelのプレビューURL *.vercel.app にも対応）
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // 同一オリジン/ヘルスチェックなど
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(new URL(origin).hostname);
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
}));

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/posts',postsRoute);
app.use('/api/users',userRoute);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));