// server.js (for Node.js)

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// 載入 .env 檔案中的環境變數
dotenv.config();

const app = express();
const port = process.env.PORT || 8893;

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
    'reversemmsg': { method: 'POST', paramName: 'message', paramType: 'body' }
    // 如果您有其他 JSON POST 請求，可以這樣定義：
    // 'login': { method: 'POST', paramName: 'credentials', paramType: 'body' }
};
// =============================

// API 路由
app.get('/api/echomsg', (req, res) => {
    const msg = req.query.msg || 'No message provided';
    res.json({ received: msg, echoed: msg });
});

app.post('/api/reversemmsg', (req, res) => {
    // 由於我們在 apiMetadata 中定義了 paramName 為 'message' 且 paramType 為 'body'
    // 前端會發送 { message: "your_string" } 這樣的 JSON
    const message = req.body.message || '';
    const reversed = message.split('').reverse().join('');
    res.json({ original: message, reversed: reversed });
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
