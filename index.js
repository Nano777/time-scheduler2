// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

const bot = new line.Client(line_config);
// -----------------------------------------------------------------------------
// ルーター設定
server.post('/callback', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);
	
	/*
	req.body.events.forEach((event) =>{
		if(event.type == "message" && event.message.type == "text"){
			if(event.message.text == "こんにちは"){
				bot.replyMessage(event.replyToken,{
					type:"text",
					text:"これはこれは"
				});
			}
		}
	})
	*/
    console.log(req.body);
});
