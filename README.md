# EXARC (Express ARC JS Framework)

這個專案是一個基於 Express.js 的輕量級後端模板，旨在提供一個高效且易於維護的前後端 API 互動架構。它特別強調在開發模式下自動同步前端 API 代理模組，確保前後端介面的一致性，大幅提升開發效率。

---

## 專案結構
```
+public
  +ajax
    +apiExecutor.js   // 基礎 API 執行器
    +authService.js   // 認證服務模組
    +apiProxy.js      // 前端 API 代理 (由後端動態生成)
  +index.html       // 靜態測試頁面
  +main.js          // 前端主邏輯
  +jquery-mobile-demo.html // jQuery Demo
  +react-demo.html         // React Demo
  +vue-demo.html           // VUE Demo
  +apiProxyInvoker.html // API 動態調用器 HTML 介面
  +apiProxyInvoker.js   // API 動態調用器 JavaScript 邏輯
+generateApiProxy.js// 後端腳本：負責動態生成 apiProxy.js
+package.json       // 專案依賴與配置
+server.js          // Express.js 後端伺服器主入口
+.env               // 環境變數配置 (包含 JWT_SECRET 和 USE_AUTH)
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
 
* **`public/jquery-mobile-demo.html`, `public/react-demo.html`, `public/vue-demo.html`**

    * 這些是額外的範例頁面，展示了如何將 `apiProxy` 和認證服務整合到常見的前端框架（jQuery Mobile, React, Vue.js）中。每個 demo 都包含了基本的 API 呼叫和登入/登出功能，您可以參考它們來將框架整合到您選擇的前端技術棧。
 

* **`public/apiProxyInvoker.html` 與 `public/apiProxyInvoker.js`**
    * 這兩個檔案共同提供了一個自動化、互動式的 API 調用與測試介面。
    * `apiProxyInvoker.js` 會動態讀取 `public/ajax/apiProxy.js` 的原始碼，解析其中的 JSDoc 註解和函數參數，並在 `apiProxyInvoker.html` 中為每個 API 方法生成一個可操作的表單。
    * 這使得開發者無需任何手動配置，即可快速查看所有後端 API 的文件並進行測試。
    * **如何使用：** 在開發模式下，您可以直接在瀏覽器中訪問此頁面進行 API 測試和探索。

* **`authMiddleware.js`**

    * 此模組提供一個彈性認證中介軟體。它會嘗試驗證 JWT Token，但不會強制中斷請求。驗證結果（req.isAuthenticated 和 req.user）會附加到請求物件上，讓路由處理器根據需要進行進一步的存取控制。

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

## 認證機制 (Authentication) 詳情

此框架整合了基於 **JWT (JSON Web Token)** 的無狀態認證機制，並提供可切換的啟用選項：

* **後端控制 (透過 `.env`)**:
    * 在專案根目錄的 `.env` 檔案中，您可以設定 `USE_AUTH=true` 來啟用後端對 API 路由的 Token 檢查。如果設定為 `false` (或不設定)，則所有 API 路由皆可公開存取。
    * `JWT_SECRET` 變數定義了用於簽發和驗證 Token 的秘密金鑰，**請務必在生產環境中更改為複雜且安全的字串**。
    * 範例 `.env` 設定:
        ```
        PORT=8893
        NODE_ENV=development
        USE_AUTH=true
        JWT_SECRET=您的超級秘密金鑰請務必更改它並保持安全！
        ```
* **前端控制 (透過 JS 程式碼)**:
    * 在 `public/main.js` 以及各個 `*-demo.html` 檔案 (例如 `react-demo.html`, `vue-demo.html`) 中，有一個 `ENABLE_LOGIN` 常數。您可以將其設定為 `true` 或 `false` 來控制前端是否顯示登入/登出相關的 UI 和邏輯。這使得您可以在開發期間獨立測試有/無認證的功能。
* **預設登入憑證**:
    * 為了方便測試，預設的登入帳號為 `testuser`，密碼為 `password123`。您可以在 `server.js` 的 `/api/login` 路由中修改此驗證邏輯。
* **Token 的管理**:
    * 成功登入後，後端會返回一個 JWT Token。`authService.js` 會將此 Token 儲存到瀏覽器的 `localStorage` 中，並自動設定給 `apiExecutor.js`，以便後續所有 API 請求都會自動帶上 `Authorization` header。

---

## 如何新增 API 端點

要在此框架中新增一個 API 端點，您需要修改 `server.js` 中的兩個部分：

1.  **在 `apiMetadata` 物件中定義新的 API 元數據**:
    * 這告訴 `generateApiProxy.js` 這個新 API 的名稱、HTTP 方法和參數類型。類似 TypeScript 的 Interface
    * 例如，新增一個 `createUser` 的 POST 請求：
        ```javascript
        const apiMetadata = {
            // ... 現有 API ...
            'createUser': { method: 'POST', paramName: 'userData', paramType: 'body' }
        };
        ```
    * `paramName` 是期望在請求體或查詢參數中接收的參數名稱。
    * `paramType` 可以是 `'query'` (用於 GET/DELETE 請求的 URL 查詢參數) 或 `'body'` (用於 POST/PUT 請求的 JSON 主體)。

2.  **在 `server.js` 中定義對應的 Express 路由**:
    * 這實際處理來自前端的請求並返回回應。
    * 承接上述 `createUser` 的例子：
        ```javascript
        app.post('/api/createUser', (req, res) => {
            const userData = req.body.userData; // 假設前端會發送 { userData: { name: '...', email: '...' } }
            // 在這裡處理用戶創建邏輯，例如存儲到資料庫
            res.json({ message: '用戶創建成功', user: userData });
        });
        ```

完成這兩步後，重新啟動伺服器 (`npm run dev`)，`generateApiProxy.js` 就會自動更新 `public/ajax/apiProxy.js`，您就可以在前端直接呼叫 `apiProxy.createUser(yourUserData)` 了。

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
```console
npm install -g degit
# 或 (使用 pnpm)
pnpm install -g degit
```
2.	複製專案模板：
```console
npm dlx degit Eden5Wu/EXARC your-new-project-name
# 或 (使用 pnpm)
pnpm dlx degit Eden5Wu/EXARC your-new-project-name
```
請將 your-new-project-name 替換為您實際的專案名稱。

3.	進入專案目錄並安裝依賴：
```console
cd your-new-project-name
npm install
# 或 (使用 pnpm)
pnpm install
```

4.	啟動開發伺服器：
```console
npm run dev
# 或 (使用 pnpm)
pnpm run dev
```
5. 伺服器啟動後：
*	apiProxy.js 將會被自動生成（或更新）。
*	您就可以在瀏覽器中訪問 http://localhost:8893 (或您在 .env 中配置的埠號) 進行測試。

