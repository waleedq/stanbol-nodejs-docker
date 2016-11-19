var request = require('request');
var io = require('socket.io')(process.env.SOCKET_PORT);


io.on('connection', function (socket) {
  socket.on("stanbol", function(data, callback){
    var options = {
      url: 'http://' + process.env.STANBOL_HOST + '/enhancer/chain/dbpedia-fst-linking',
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
      }else{
        console.log({error: error});
      }
    });
  });
});