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
            console.error("JWT Verify Error:", err); // トークン検証エラーの内容をログに出力
            return res.status(401).json({ message: '権限がありません' });
        }
        req.userId = decoded.id;

        next();
    });
}

module.exports = isAuthenticated;