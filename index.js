// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
var format = require("pg-format");

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
const cmd = ["#登録","#変更","X曜日"]
client.connect();

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/callback', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);
	
	req.body.events.forEach((event) =>{
		var userid = event.source.userId;
		if(event.type == "message" && event.message.type == "text"){
			console.log(event.message.text)
			switch(true){

				case /^[月火水木金土日]曜日?.*/.test(event.message.text):
					var dayName = event.message.text.slice(0,1) + "曜日";
					var table = 'time_schedule';
					var where = "WHERE day_of_week='"+ dayName + "' AND (userid='"+ userid +"' OR userid='null')ORDER BY period";
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
					var where = "WHERE day_of_week='"+ dayName + "' AND (userid='"+ userid +"' OR userid='null')ORDER BY period";
					SelectQuery(event, table, where, 'list');
					break;
				case /^#.*/.test(event.message.text):
					switch(true){
						case/^#ヘルプ/.test(event.message.text):
							var rep = "";
							cmd.forEach(function(name){
								rep = rep + name + "\n";
							});
							rep =rep+"基本的なコマンド一覧だ。詳しくは自分で色々試してみてくれ。";
							repm(rep);
							break;
						case /^#登録.*/.test(event.message.text):
							var message = [
								{type:"text",text:"必須はすでに登録してあるから選択科目を登録してくれ。"},
								{type:"text",text:"学年-クオーター-曜日-時限-講義名-場所\nの形で入力すれば登録できるぞ！\n名前と場所は自分が分かるように入力してくれて構わないが'-'は挟まないでくれ。"},
								{type:"text",text:"例:\n1-3-木曜日-1-法学入門-共A11"}
							]
							bot.replyMessage(event.replyToken,message);
							break;
						case /^#変更.*/.test(event.message.text):
							repm("準備中だ。\n急用なら開発者に直接連絡してみてくれ。");
							break;
						default:
							var name = event.message.text.slice(1);
							var table = 'mails';
							var where = "WHERE name='" + name + "' OR hiragana='" + name + "'";
					
							SelectQuery(event, table, where, 'mail');
							break;
					}
					break;
				case /^[1-6]-[1-4]-[月火水木金]曜日-[1-6]-.*-.*/.test(event.message.text):
					console.log('登録モード')
					var data = event.message.text.split('-');
					if(data.length != 6){
						repm("形式が間違っているようだ。\nもう一度見直してみてくれ。")
						break;
					}
					var values = [data[0], data[1], data[2], data[3], data[4], data[5], userid]
					var query = 'INSERT INTO time_schedule (grade, quarter, day_of_week, period , name, area, userid) VALUES ($1, $2, $3, $4, $5, $6, $7);'
					
					InsertQuery(data, event, query, values);
					break;
				case /開発者/.test(event.message.text):
					repm("CREATED BY NANO");
					break;
				default:
					repm("よく分からんな。\n「#ヘルプ」でコマンド一覧を見ることが出来る。一度読んでみたらどうだ？")
					break;
			}
		}else if(event.type == "follow"){
			repm("友だち追加ありがとう。\nまず初めに「#登録」と話しかけて時間割の登録をしてくれ。")
		}
		
		function repm(message){
			bot.replyMessage(event.replyToken,{
				type:"text",
				text:message
			})
		}
	})
});


//--------------------------------------------------------------------
//SELECT RECORDS
//--------------------------------------------------------------------
function SelectQuery(event, table, where, type){
	const query = "SELECT * FROM " + table + " "+ where + ';';
	var reply = '';
	
	client.query(query,function(error,result){
		//--------------------------------------
		//No result
		//--------------------------------------
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
		//--------------------------------------
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

//--------------------------------------------------------------------
//INSERT RECORD
//--------------------------------------------------------------------
function InsertQuery(data, event, query, values,userid){
	var reply = "";
	var check = "select count(*) from time_schedule where grade=%s AND quarter=%s AND day_of_week=%L AND userid='" + event.source.userId + "';";
	var sql = format(check,values[0],values[1],values[2],values[3]);
	
	console.log(sql);
	
	client.query(sql)
	.then(res=> {
		if(res.rows[0].count != 0){
			//--------------------------------------
			//Duplicate record
			//--------------------------------------
			bot.replyMessage(event.replyToken,{
				type:"text",
				text:"その時間帯はすでに登録されてるみたいだ。\n変更したい場合は「#変更」と話しかけてくれ。"
			});
		}else{
			client.query(query,values)
			.then(res => {
				//--------------------------------------
				//completed registration
				//--------------------------------------
				console.log(res)
				
				reply = "学年："+data[0]+"\n"
						+"クオーター："+data[1]+"\n"
						+"曜日："+data[2]+"\n"
						+"時間："+data[3]+"限目\n"
						+"科目名："+data[4]+"\n"
						+"場所："+data[5]+"\n"
						+"上の内容で登録したぜ。";
				
				bot.replyMessage(event.replyToken,{
					type:"text",
					text:reply
				});
			})
		}
	})
	
}
