// server.js (for Node.js)

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // 導入 jsonwebtoken 用於簽發 Token
const authenticateTokenStrict = require('./authMiddleware'); // 導入您新的嚴格認證中介軟體

// 載入 .env 檔案中的環境變數
dotenv.config();

const app = express();
const port = process.env.PORT || 8893;
// 新增環境變數來控制認證是否啟用，預設為關閉
const useAuth = process.env.USE_AUTH === 'true';

// 中介層設置
app.use(express.json()); // 用於解析 JSON 格式的請求主體
app.use(express.urlencoded({ extended: false })); // 用於解析 URL-encoded 格式的請求主體
app.use(cookieParser()); // 用於解析 Cookie

// 靜態檔案服務
app.use(express.static(path.join(__dirname, 'public')));

// 新增：根據環境變數決定是否應用認證中介軟體
if (useAuth) {
    // 將嚴格認證中介軟體應用於所有 /api 路由
    console.log('認證功能已啟用：所有 /api/* 路由將進行嚴格 JWT Token 檢查。');
    // 在 login 路由之前套用中介軟體
    // 確保登入本身不需要 Token
    app.post('/api/login', (req, res) => {
        // 這裡只是個示範，實際應用中應從資料庫驗證使用者。
        const { username, password } = req.body;
        // 假設驗證成功
        if (username === 'testuser' && password === 'password123') {
            // 生成一個 JWT Token
            // payload 應該包含用戶的識別資訊，例如 ID 和角色
            const user = { id: 1, name: username, role: 'admin' };
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            // 返回 Token 給前端
            return res.json({ message: '登入成功', token: token, user: user });
        }
        // 驗證失敗
        res.status(401).json({ message: '無效的使用者名稱或密碼' });
    });

    app.use('/api', authenticateTokenStrict); // 將嚴格模式中介軟體應用於所有其他 /api 路由
} else {
    console.log('認證功能已停用。所有 API 路由皆可公開存取。');
    // 即使認證停用，也需要提供 login 路由
    app.post('/api/login', (req, res) => {
        const { username, password } = req.body;
        if (username === 'testuser' && password === 'password123') {
            const user = { id: 1, name: username, role: 'admin' };
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: '登入成功 (認證停用)', token: token, user: user });
        }
        res.status(401).json({ message: '無效的使用者名稱或密碼' });
    });
}

// API 路由
// 這些路由現在將在 `useAuth` 為 true 時受到 `authenticateTokenStrict` 保護。
app.get('/api/echomsg/:msg', (req, res) => {
    // 在嚴格模式下，如果能執行到這裡，req.user 一定存在。
    const msg = req.params.msg || 'No message provided';
    const response = { 
        received: msg, 
        echoed: msg,
        authStatus: '已認證', // 在嚴格模式下，只有認證過的請求才能到達此處
        user: req.user // 附加用戶資訊
    };
    res.json(response);
});

app.post('/api/reversemmsg', (req, res) => {
    // 在嚴格模式下，如果能執行到這裡，req.user 一定存在。
    const message = req.body.message || '';
    const reversed = message.split('').reverse().join('');
    const response = { 
        original: message, 
        reversed: reversed,
        authStatus: '已認證', // 在嚴格模式下，只有認證過的請求才能到達此處
        user: req.user // 附加用戶資訊
    };
    res.json(response);
});


// --- 新增：在所有路由定義之後，調用 API 代理生成腳本 ---
// 僅在開發模式下生成檔案
if (process.env.NODE_ENV !== 'production') {
    const generateApiProxyFile = require('./generateApiProxy'); // 確保路徑正確
    // 將 Express app 實例傳遞給生成函數
    generateApiProxyFile(app);
}
// --- 結束新增 ---

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器運行在 http://localhost:${port}`);
    console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
