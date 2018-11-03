var http = require('http'); //httpモジュール呼び出し
http.createServer(function (request, response) {
    // リクエストを受けると以下のレスポンスを送信する
    response.writeHead(200, {'Content-Type': 'text/plain'}); //レスポンスヘッダーに書き込み
    response.end('Hello World\n'); // レスポンスボディに書き込み＆レスポンス送信を完了する
}).listen(8080);  //8080番ポートで待ち受け