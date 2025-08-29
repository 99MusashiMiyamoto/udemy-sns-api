const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const  isAuthenticated  = require("../middlewares/isAuthenticated");

//つぶやき投稿用API
router.post("/", isAuthenticated, async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: "つぶやきが入力されていません" });
    }
    
     try {
        const newPost = await prisma.post.create({
            data: {
                content,
                authorId: req.user.id,
            },
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
            },
        });

        res.status(201).json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "サーバーエラーです。" });
    }
});

//最新つぶやき取得用API
router.get("/get_latest_post", async (req, res) => {
    try {
        const latestPosts = await prisma.post.findMany({
            take: 10, 
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        return res.status(200).json(latestPosts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "サーバーエラーです。" });
    }
});

//その閲覧しているユーザーの投稿内容だけを取得
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

try {
    const posts = await prisma.post.findMany({
        where: {
            authorId: parseInt(userId),
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                include: {
                    profile: true,
                },
            },
        },
    });

    res.status(200).json({
        posts,
    });

} catch (err) {
console.error(err);
res.status(500).json({ message: "サーバーエラーです。" });
}
});

module.exports = router;