// server.js (for Node.js)

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // 導入 jsonwebtoken 用於簽發 Token
const authenticateTokenFlexible = require('./authMiddleware'); // 導入您的認證中介軟體

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

// ==== API 元數據定義 ====
// 在這裡集中定義您的 API 端點、方法和參數類型
// 這些資訊會傳遞給 generateApiProxy.js 用於生成前端代理
const apiMetadata = {
    // echomsg 是 GET 請求，參數 'msg' 來自 query
    'echomsg': { method: 'GET', paramName: 'msg', paramType: 'query' },
    // reversemmsg 是 POST 請求，參數 'message' 是 JSON body
    'reversemmsg': { method: 'POST', paramName: 'message', paramType: 'body' },
    // 新增：login 是 POST 請求，參數 'credentials' 是 JSON body
    'login': { method: 'POST', paramName: 'credentials', paramType: 'body' }
};
// =============================

// 新增：根據環境變數決定是否應用認證中介軟體
if (useAuth) {
    // 將彈性認證中介軟體應用於所有 /api 路由
    console.log('認證功能已啟用：所有 /api/* 路由將檢查 JWT Token。');
    app.use('/api', authenticateTokenFlexible); //
} else {
    console.log('認證功能已停用。所有 API 路由皆可公開存取。');
}

// 新增：登入 API 路由
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

// API 路由
app.get('/api/echomsg', (req, res) => {
    const msg = req.query.msg || 'No message provided';
    let response = { received: msg, echoed: msg };

    // 新增：如果認證啟用，根據驗證結果調整回應
    if (useAuth) {
        if (req.isAuthenticated) { //
            response.authStatus = '已認證';
            response.user = req.user; //
        } else {
            response.authStatus = '未認證';
        }
    }
    res.json(response);
});

app.post('/api/reversemmsg', (req, res) => {
    const message = req.body.message || '';
    const reversed = message.split('').reverse().join('');
    let response = { original: message, reversed: reversed };

    // 新增：如果認證啟用，根據驗證結果調整回應
    if (useAuth) {
        if (req.isAuthenticated) { //
            response.authStatus = '已認證';
            response.user = req.user; //
        } else {
            response.authStatus = '未認證';
        }
    }
    res.json(response);
});


// --- 新增：在所有路由定義之後，調用 API 代理生成腳本 ---
// 僅在開發模式下生成檔案
if (process.env.NODE_ENV !== 'production') {
    const generateApiProxyFile = require('./generateApiProxy'); // 確保路徑正確
    // 將 Express app 實例和 apiMetadata 物件傳遞給生成函數
    generateApiProxyFile(app, apiMetadata);
}
// --- 結束新增 ---

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器運行在 http://localhost:${port}`);
    console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;