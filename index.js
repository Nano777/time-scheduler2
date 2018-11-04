// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken:'CaG10hTyBbHkVLRtLZ4B7NCoQ2VkTr7KxlmggfXD3yZvwSP2jD6BjtuTq4I73CLmigmn8q45BO5pZNaXXJQ/jwqKR0dbzoVoVRxddSmCXUe8spQ4H4ji8FDn15+RFBXxNu7aFR8LfGSqUeSV5jeaBgdB04t89/1O/w1cDnyilFU=', // 環境変数からアクセストークンをセットしています
    channelSecret:'b893f338979de6fd50e02a8d97ae3cfb'// 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);


// -----------------------------------------------------------------------------
// ルーター設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);
    console.log(req.body);
});
