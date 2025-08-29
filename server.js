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

// 許可するオリジンのリスト
const allowedOrigins = [
  'https://udemy-sns-client-eta.vercel.app',
  'https://udemy-sns-client-99b3xv6zs-mmiyamotos-projects.vercel.app'
];

// CORS設定
const corsOptions = {
  origin: function (origin, callback) {
    //許可リストにないオリジンからのリクエスト、またはオリジンがないリクエスト（Postmanなど）を許可する
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/posts',postsRoute);
app.use('/api/users',userRoute);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));