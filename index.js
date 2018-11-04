// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const ACCESS_TOKEN = 'CaG10hTyBbHkVLRtLZ4B7NCoQ2VkTr7KxlmggfXD3yZvwSP2jD6BjtuTq4I73CLmigmn8q45BO5pZNaXXJQ/jwqKR0dbzoVoVRxddSmCXUe8spQ4H4ji8FDn15+RFBXxNu7aFR8LfGSqUeSV5jeaBgdB04t89/1O/w1cDnyilFU='
const CHANNEL_SECRET = 'b893f338979de6fd50e02a8d97ae3cfb'
const DATABASE_URL = 'ec2-50-16-196-57.compute-1.amazonaws.com'

const line_config = {
    channelAccessToken:ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret:CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

const bot = new line.Client(line_config);

const pg = require('pg');
const config = {
	user:'npymhmwnhroshl',
	host:'ec2-50-16-196-57.compute-1.amazonaws.com',
	database:'dck8klhql4jikk',
	password:'a15e5e16473dac9b17291621e1b46ffd92cc9f757155456d061c20efdca5d185',
	port:5432
};

const client = new pg.Client(config);
client.connect();

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/callback', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);
	
	req.body.events.forEach((event) =>{
		if(event.type == "message" && event.message.type == "text"){
			switch(true){
				case /[月火水木金土日]曜日.*/.test(event.message.text):
					
					queryDatabase(event, 'day_of_week', "'" + event.message.text +"' ORDER BY period");
					break;
				case /時間割/.test(event.message.text):
					
					bot.replyMessage(event.replyToken,{
						type:"text",
						text:"a"
					});
					break;
				default:
					bot.replyMessage(event.replyToken,{
						type:"text",
						text:"知りません"
					});
					break;
			}
			/*
			if(event.message.text == "こんにちは"){
				bot.replyMessage(event.replyToken,{
					type:"text",
					text:"これはこれは"
				});
			}
			*/
		}
	})
    //console.log(req.body);
});

function queryDatabase(event, column, condition, callback){
	const query = 'SELECT * FROM time_schedule WHERE '+column+'='+condition+';';
	var reply = '';
	
	client.query(query,function(error,result){
		if(result == null){
			bot.replyMessage(event.replyToken,{
				type:"text",
				text:"データなし"
			});	
			return;
		}
		result.rows.forEach(function(row){
			reply = reply+row.period+'限.'+row.name+'\n';
		})
		reply = reply.slice(0,-2);
		bot.replyMessage(event.replyToken,{
			type:"text",
			text:reply
		});	
	});
}
