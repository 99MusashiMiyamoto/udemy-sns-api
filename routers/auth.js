const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateIdenticon = require("../utils/generateidenticon");

//新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "このメールアドレスは既に使用されています。" });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            bio: "はじめまして",
            profileImageUrl: defaultIconImage,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "ユーザー登録に失敗しました。" });
  }
});

//ログインAPI
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        return res.status(401).json({ error: "ユーザーが存在しません" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "パスワードが間違っています" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return res.json({ token });
});

module.exports = router;