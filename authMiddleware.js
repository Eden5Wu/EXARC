// authMiddleware.js
// 這個模組包含一個 Express 中介軟體，用於嚴格驗證 JWT Token。

const jwt = require('jsonwebtoken'); // 導入 jsonwebtoken 函式庫，用於 Token 驗證

/**
 * 嚴格認證中介軟體：
 * 檢查請求的 Authorization 頭部是否存在有效的 JWT Token。
 * - 如果 Token 無效或缺失，直接中斷請求並返回 401 Unauthorized。
 * - 如果 Token 有效，將用戶資訊附加到 `req.user` 並呼叫 `next()`。
 *
 * @param {Object} req - Express 請求物件。
 * @param {Object} res - Express 回應物件。
 * @param {Function} next - 下一個中介軟體函式。
 */
const authenticateTokenStrict = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // 沒有 Token，返回 401 錯誤。
        return res.status(401).json({ message: '存取被拒絕：需要認證 Token。' });
    }

    // 嘗試驗證 Token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token 無效 (例如過期、被篡改)，返回 403 Forbidden 錯誤。
            console.warn('Token 驗證失敗:', err.message);
            return res.status(403).json({ message: '存取被拒絕：Token 無效或已過期。' });
        }
        
        // Token 有效，將用戶資訊附加到請求物件中。
        req.user = user;
        next(); // 繼續處理下一個中介軟體或路由處理器
    });
};

module.exports = authenticateTokenStrict;