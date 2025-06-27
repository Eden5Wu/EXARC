// authMiddleware.js
// 這個模組包含一個 Express 中介軟體，用於彈性地驗證 JWT Token。

const jwt = require('jsonwebtoken'); // 導入 jsonwebtoken 函式庫，用於 Token 驗證

/**
 * 彈性認證中介軟體：
 * 嘗試驗證請求的 Authorization 頭部是否存在 JWT Token。
 * 不會直接中斷請求，而是將驗證結果附加到 `req` 物件上：
 * - 如果 Token 有效，`req.user` 將包含用戶資訊，`req.isAuthenticated` 為 true。
 * - 如果 Token 無效或缺失，`req.user` 為 null，`req.isAuthenticated` 為 false。
 *
 * @param {Object} req - Express 請求物件。
 * @param {Object} res - Express 回應物件。
 * @param {Function} next - 下一個中介軟體函式。
 */
const authenticateTokenFlexible = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    req.isAuthenticated = false; // 預設為未認證
    req.user = null; // 預設用戶資訊為空

    if (token == null) {
        // 沒有 Token，直接呼叫 next()，讓請求繼續，但 `req.isAuthenticated` 為 false。
        return next();
    }

    // 嘗試驗證 Token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token 無效 (例如過期、被篡改)，依然呼叫 next()，但 `req.isAuthenticated` 為 false。
            // 您可以選擇在這裡記錄錯誤，但不會中斷請求。
            console.warn('Token 驗證失敗:', err.message);
        } else {
            // Token 有效，將用戶資訊附加到請求物件中，並設定為已認證。
            req.isAuthenticated = true;
            req.user = user;
        }
        next(); // 繼續處理下一個中介軟體或路由處理器
    });
};

module.exports = authenticateTokenFlexible;