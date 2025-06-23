// server.js

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 8893;

// 中介層設置
app.use(express.json()); // 用於解析 JSON 格式的請求主體
app.use(express.urlencoded({ extended: false })); // 用於解析 URL-encoded 格式的請求主體
app.use(cookieParser()); // 用於解析 Cookie

// 靜態檔案服務 (重要：這通常應在 API 路由之前，如果您服務 index.html)
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
// 在這裡定義您的所有 API 路由。這些路由會被 generateApiProxyFile 腳本檢查並用於生成前端代理。
app.get('/api/echomsg', (req, res) => {
    const msg = req.query.msg || 'No message provided';
    res.json({ received: msg, echoed: msg });
});

app.post('/api/reversemmsg', (req, res) => {
    const message = req.body.message || '';
    const reversed = message.split('').reverse().join('');
    res.json({ original: message, reversed: reversed });
});

// --- 新增：在所有路由定義之後，調用 API 代理生成腳本 ---
// 僅在開發模式下生成檔案
if (process.env.NODE_ENV !== 'production') {
    const generateApiProxyFile = require('./generateApiProxy'); // 確保路徑正確
    generateApiProxyFile(app); // 將 Express app 實例傳遞給生成函數
}
// --- 結束新增 ---

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器運行在 http://localhost:${port}`);
    console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
