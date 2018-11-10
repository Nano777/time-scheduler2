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
				case /^[月火水木金土日]曜日.*/.test(event.message.text):
					var table = 'time_schedule';
					var where = "WHERE day_of_week='"+ event.message.text + "' ORDER BY period";
					SelectQuery(event, table, where, 'list');
					break;
				case /^時間割/.test(event.message.text):
					var table = 'time_schedule';
					var where = "";
					SelectQuery(event, table, where, 'list');
					break;
				case /^きょう|今日/.test(event.message.text):
					var dayName = '日月火水木金土'[new Date().getDay()];
				case /あした|明日/.test(event.message.text):
					if(typeof(dayName) == "undefined"){
						var dayName = '日月火水木金土'[new Date().getDay() + 1];
					}
					
					dayName = dayName+"曜日"
					
					var table = 'time_schedule';
					var where = "WHERE day_of_week='"+ dayName + "' ORDER BY period";
					SelectQuery(event, table, where, 'list');
					break;
				case /^@.*/.test(event.message.text):
					console.log('@モード')
					var name = event.message.text.slice(1);
					var table = 'mails';
					var where = "WHERE name='" + name + "' OR hiragana='" + name + "'";
					SelectQuery(event, table, where, 'mail');
					break;
				case /^[1-6]-[1-4]-[月火水木金]曜日-[1-6]-.*-.*/.test(event.message.text):
					console.log('登録モード')
					var data = event.message.text.split('-');
					var values = [data[0], data[1], data[2], data[3], data[4], data[5], event.source.user_id]
					console.log(event.source.user_id)
					//var query = "INSERT INTO time_schedule VALUES ("+data[0]+","+data[1]+",'"+data[2]+"',"+data[3]+",'"+data[4]+"','"+data[5]+"','"+event.source.user_id+"');"; 
					var query = 'INSERT INTO time_schedule (grade, quarter, day_of_week, period , name, area, userid) VALUES ($1, $2, $3, $4, $5, $6, $7);'
					InsertQuery(data, event, query, values);
					break;
				default:
					bot.replyMessage(event.replyToken,{
						type:"text",
						text:"知りません"
					});
					break;
			}
		}
	})
    //console.log(req.body);
});

function SelectQuery(event, table, where, type){
	const query = "SELECT * FROM " + table + " "+ where + ';';
	var reply = '';
	
	client.query(query,function(error,result){
		//--------------------------------------
		//No result
		if(result.rowCount == 0){
			console.log(result);
			bot.replyMessage(event.replyToken,{
				type:"text",
				text:"データなし"
			});	
			return;
		}
		//console.log(result);
		
		//--------------------------------------
		//IndentMessage
		switch(true){
			case /list/.test(type):
				result.rows.forEach(function(row){
					reply = reply+row.period+'限.'+row.name+ '(' + row.area +')\n';
				});
				reply = reply.slice(0,-1);
				break;
			case /mail/.test(type):
				reply = result.rows[0].name + "\n" + result.rows[0].address;
				break;
			default:
				reply="err";
				break;
		}
		
		//--------------------------------------
		//SendMessage
		bot.replyMessage(event.replyToken,{
			type:"text",
			text:reply
		});	
	});
}
function InsertQuery(data, event, query, values){
	var reply = "";
	
	
	client.query(query,values)
	.then(res => {
		console.log(res)
		reply = "学年："+data[0]+"\n第"+data[1]+"クオーター\n"+data[2]+"\n"+data[3]+"限目\n科目名："+data[4]+"\n場所："+data[5]+"\n上記の内容で登録しました";
	
		bot.replyMessage(event.replyToken,{
			type:"text",
			text:reply
		});
	})
	
	
	
	
}
