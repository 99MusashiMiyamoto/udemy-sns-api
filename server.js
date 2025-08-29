const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();
const authRoute = require('./routers/auth');
const postsRoute = require('./routers/posts');
const cors = require('cors');



require('dotenv').config();


const PORT = 5000;

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/posts',postsRoute);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
