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

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/posts',postsRoute);
app.use('/api/users',userRoute);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));