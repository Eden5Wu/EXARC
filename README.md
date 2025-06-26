# EXARC (Express ARC JS Framework)

這個專案是一個基於 Express.js 的輕量級後端模板，旨在提供一個高效且易於維護的前後端 API 互動架構。它特別強調在開發模式下自動同步前端 API 代理模組，確保前後端介面的一致性，大幅提升開發效率。

---

## 專案結構
```
+root
+public
  +ajax
    +apiExecutor.js   // 基礎 API 執行器
    +authService.js   // 認證服務模組
    +apiProxy.js      // 前端 API 代理 (由後端動態生成)
  +index.html       // 靜態測試頁面
  +main.js          // 前端主邏輯
+generateApiProxy.js// 後端腳本：負責動態生成 apiProxy.js
+package.json       // 專案依賴與配置
+server.js          // Express.js 後端伺服器主入口
```

---

## 核心功能與檔案說明

這個框架的核心理念是將前端與後端的 API 呼叫流程自動化和標準化，讓開發者能更專注於業務邏輯而非重複的 API 定義。

* **`public/ajax/apiExecutor.js`**
    * 這是所有 API 請求的基礎執行器。它封裝了 `fetch` API，負責處理 HTTP 方法 (GET/POST/PUT/DELETE)、請求頭 (headers)、JSON 序列化與反序列化，以及統一的錯誤處理。
    * 它也負責設定和取得認證 Token (`Authorization` header)。
    * **如何使用：** 其他模組會透過它來發送底層的 HTTP 請求。

* **`public/ajax/authService.js`**
    * 處理用戶認證的業務邏輯，例如登入、登出。
    * 它使用 `apiExecutor.js` 來與後端認證 API 溝通。
    * 負責將認證 Token 儲存到 `localStorage` 中以實現持久化登入狀態，並在應用程式啟動時恢復。
    * **如何使用：** 您可以直接在前端呼叫 `login(credentials)`、`logout()`、`isAuthenticated()` 等函數來管理用戶認證狀態。

* **`public/ajax/apiProxy.js`**
    * 這是**前端 API 呼叫的核心代理模組**。它提供了一系列語義化的函數，讓前端可以直接以 `apiProxy.yourApiName(params)` 的方式呼叫後端 API，而無需關心底層的 URL 路徑、HTTP 方法或參數傳遞方式。
    * **動態生成：** 這個檔案的內容**不會**手動修改。它會在您啟動後端伺服器時，由 `generateApiProxy.js` 腳本根據 `server.js` 中定義的後端路由自動生成或更新。這確保了前端 API 介面與後端始終保持同步。
    * **如何使用：** 在您的前端 JavaScript (`main.js` 或其他模組) 中，直接 `import { apiProxy } from './ajax/apiProxy.js';`，然後調用例如 `apiProxy.echomsg(message)` 或 `apiProxy.reversemmsg(data)`。

* **`public/index.html` 與 `public/main.js`**
    * `index.html` 是前端的進入點，載入所有必要的 JavaScript 模組。
    * `main.js` 是前端的應用程式邏輯，它示範了如何使用 `apiProxy.js` 來呼叫後端 API 並顯示回應。
    * **如何使用：** 這是您編寫前端使用者介面和互動邏輯的地方，使用 `apiProxy` 來與後端溝通。

* **`generateApiProxy.js`**
    * 這是一個**後端 Node.js 腳本**，在 `server.js` 啟動時被調用（僅限開發模式）。
    * 它的職責是讀取 Express 應用程式 (`server.js`) 中定義的所有 API 路由，並根據這些路由資訊自動生成 `public/ajax/apiProxy.js` 的內容。
    * **如何使用：** 作為開發工具，您通常不需要直接調用或修改它，它會在 `npm run dev` 啟動時自動執行。

* **`server.js`**
    * Express.js 後端應用程式的主入口點。
    * 它配置了 Express 伺服器、中介層、定義了所有的後端 API 路由。
    * 在開發模式下，它會引用並執行 `generateApiProxy.js` 腳本來自動更新前端的 `apiProxy.js`。
    * **如何使用：** 定義您的後端 API 端點，並啟動 Express 伺服器。

---

## 解決 `nodemon` 無限重啟問題

由於 `generateApiProxy.js` 會在每次 `server.js` 啟動時寫入 `public/ajax/apiProxy.js` 檔案，`nodemon` 會偵測到此變動並觸發重啟，導致無限迴圈。為了解決此問題，您需要在 `package.json` 中配置 `nodemon` 忽略對此檔案的監聽。

在您的 `package.json` 中添加 `nodemonConfig`：

```json
{
  // ... 其他配置 ...
  "devDependencies": {
    "nodemon": "^3.1.4"
  },
  "nodemonConfig": {
    "ignore": [
      "public/ajax/apiProxy.js"  <-- 告訴 nodemon 忽略這個檔案
    ]
  }
}
```
# 如何使用 (快速啟動專案)
您可以透過 degit 工具快速複製此專案模板，開始您的開發：
1.	確保安裝了 degit (如果尚未安裝)：
```
npm install -g degit
\# 或 (使用 pnpm)
pnpm install -g degit
```
2.	複製專案模板：
```
npm dlx degit Eden5Wu/EXARC your-new-project-name
\# 或 (使用 pnpm)
pnpm dlx degit Eden5Wu/EXARC your-new-project-name
```
請將 your-new-project-name 替換為您實際的專案名稱。

3.	進入專案目錄並安裝依賴：
```
cd your-new-project-name
npm install
\# 或 (使用 pnpm)
pnpm install
```

4.	啟動開發伺服器：
```
npm run dev
\# 或 (使用 pnpm)
pnpm run dev
```
5. 伺服器啟動後：
*	apiProxy.js 將會被自動生成（或更新）。
*	您就可以在瀏覽器中訪問 http://localhost:8893 (或您在 .env 中配置的埠號) 進行測試。

