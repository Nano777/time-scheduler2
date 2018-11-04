// import modules
const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
var access_token = 'CaG10hTyBbHkVLRtLZ4B7NCoQ2VkTr7KxlmggfXD3yZvwSP2jD6BjtuTq4I73CLmigmn8q45BO5pZNaXXJQ/jwqKR0dbzoVoVRxddSmCXUe8spQ4H4ji8FDn15+RFBXxNu7aFR8LfGSqUeSV5jeaBgdB04t89/1O/w1cDnyilFU=';

// create a new express server
const app = express()

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})) // for parsing application/x-www-form-urlencoded

var re_text = "null";

app.post('/callback', (req, res) => {
  const options = {
    method: 'POST',
    uri: 'https://api.line.me/v2/bot/message/reply',
    body: {
      replyToken: req.body.events[0].replyToken,
      messages: [{
        type: 'text',
        text: re_text // ここに指定した文字列がボットの発言になる
      }]
    },
    auth: {
      bearer: access_token // ここは自分のtokenに書き換える
    },
    json: true
  }
  request(options, (err, response, body) => {
    console.log(JSON.stringify(response))
  })
  res.send('OK')
})

app.listen(process.env.PORT || 3000, () => {
  console.log('server starting on PORT:' + process.env.PORT)
})