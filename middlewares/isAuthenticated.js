const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    if (!process.env.JWT_SECRET) {
        console.error("エラー: JWT_SECRETが.envファイルに設定されていません。");
        return res.status(500).json({ message: "サーバー設定エラーです。" });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: '権限がありません' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT Verify Error:", err);
            return res.status(401).json({ message: '権限がありません' });
        }
        // posts.jsが期待する形式に合わせて、req.userオブジェクトを作成
        req.user = { id: decoded.id };

        next();
    });
}

module.exports = isAuthenticated;
