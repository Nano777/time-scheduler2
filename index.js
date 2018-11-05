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

const WeekChars = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日","日曜日"];
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
					const where = "WHERE day_of_week='"+ event.message.txt +"' ORDER BY period";
					queryDatabase(event, where, 'list');
					break;
				case /時間割/.test(event.message.text):
					bot.replyMessage(event.replyToken,{
						type:"text",
						text:"a"
					});
					break;
				case /きょう|今日/.test(event.message.text):
				case /あした|明日/.test(event.message.text):
					var dayName;
					if(/きょう|今日/.test(event.message.text)){
						dayName = '日月火水木金土'[new Date().getDay()];
					}else{
						dayName = '日月火水木金土'[new Date().getDay() + 1];
					}
					dayName = dayName+"曜日"
					const where = "WHERE day_of_week='"+ dayName + "' ORDER BY period";
					queryDatabase(event, where, 'list');
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

function queryDatabase(event, where, type){
	const query = 'SELECT * FROM time_schedule '+ where + ';';
	var reply = '';
	
	client.query(query,function(error,result){
		if(result.rowCount == 0){
			console.log(result);
			bot.replyMessage(event.replyToken,{
				type:"text",
				text:"データなし"
			});	
			return;
		}
		//console.log(result);
		
		switch(true){
			case /list/.test(type):
				result.rows.forEach(function(row){
					reply = reply+row.period+'限.'+row.name+ '(' + row.area +')\n';
				});
				reply = reply.slice(0,-1);
				break;
			default:
				reply="err";
		}
		
		bot.replyMessage(event.replyToken,{
			type:"text",
			text:reply
		});	
	});
}
