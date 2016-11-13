var request = require('request');
var io = require('socket.io')(8071);


io.on('connection', function (socket) {
  socket.on("stanbol", function(data, callback){
    var options = {
      url: 'http://127.0.0.1:8070/enhancer/chain/dbpedia-fst-linking',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'text/plain'
      },
      body: data.text
    };

    request.post(options,function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        callback(info);
      }
    });
  });
});