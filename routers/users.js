const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const  isAuthenticated  = require("../middlewares/isAuthenticated");

router.get("/find", isAuthenticated, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                profile: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
        }

        // パスワードはレスポンスに含めないように注意
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({ user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/profile/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                profile: true,
                posts: {
                    orderBy: { createdAt: "desc" },
                    include: { author: { include: { profile: true } } },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

    // レスポンスからパスワードを削除
    const sanitizedUser = {
      ...user,
      posts: user.posts.map(post => {
        // ネストされたauthorからもパスワードを削除
        const { password: _authorPassword, ...authorWithoutPassword } = post.author;
        return { ...post, author: authorWithoutPassword };
      })
    };
    delete sanitizedUser.password;

    res.status(200).json(sanitizedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;