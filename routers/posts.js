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
                authorid: req.user.id, // authorId を authorid に修正
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
                likes: true,
            },
        });
        // 返却時に likes の数のみを渡し、author.password を除外
        const response = latestPosts.map(p => {
          const { password: _pw, ...authorWithoutPassword } = p.author || {};
          return {
            ...p,
            author: authorWithoutPassword,
            likes: undefined,
            likesCount: p.likes.length,
          };
        });
        return res.status(200).json(response);
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
            authorid: parseInt(userId), // authorId を authorid に修正
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
            likes: true,
        },
    });

    const response = posts.map(p => {
      const { password: _pw, ...authorWithoutPassword } = p.author || {};
      return {
        ...p,
        author: authorWithoutPassword,
        likes: undefined,
        likesCount: p.likes.length,
      };
    });

    res.status(200).json({
        posts: response,
    });

} catch (err) {
console.error(err);
res.status(500).json({ message: "サーバーエラーです。" });
}
});

// いいねトグル
router.post("/:postId/like", isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId: parseInt(postId) } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId, postId: parseInt(postId) } });
    }

    const count = await prisma.like.count({ where: { postId: parseInt(postId) } });
    res.status(200).json({ likesCount: count, liked: !existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

module.exports = router;