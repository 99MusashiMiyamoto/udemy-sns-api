const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const  isAuthenticated  = require("../middlewares/isAuthenticated");

router.get("/find", isAuthenticated, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                profile: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
        }

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

    const sanitizedUser = {
      ...user,
      password: undefined,
      posts: user.posts.map(post => {
        const { password: _authorPassword, ...authorWithoutPassword } = post.author;
        return { ...post, author: authorWithoutPassword };
      })
    };

    res.status(200).json(sanitizedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// プロフィール編集用API
router.put("/profile", isAuthenticated, async (req, res) => {
    const { bio, username } = req.body;
    const userId = req.user.id;

    try {
        const updatedUser = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { username },
            }),
            prisma.profile.upsert({
                where: { userid: userId },
                create: {
                    userid: userId,
                    bio,
                },
                update: {
                    bio,
                },
            }),
        ]);

        res.status(200).json(updatedUser);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;