var request = require('request');
var https = require('https');
var fs = require('fs');
var io = require('socket.io');

if(!process.env.HTTPS){
  io = io.listen(process.env.SOCKET_PORT);
}else{
  var pkey = fs.readFileSync('key.pem');
  var pcert = fs.readFileSync('cert.pem');

  var options = {
    key: pkey,
    cert: pcert
  };

  var app = https.createServer(options, function(req, res){
    res.writeHead(200);
    res.end("welcome to vardot!\n");
  });
  io = io.listen(app);
  app.listen(process.env.SOCKET_PORT);
}

var proccessData = function(data){
  var tags = {}
  var groupedTags = {}
  if(data && data["@graph"]){
    for(id in data["@graph"]){
     var graph = data["@graph"][id];
     if(graph && graph["enhancer:entity-label"]){
      var tag = graph["enhancer:entity-label"]["@value"];
      var stripedTag = tag.toLowerCase().replace(/[\s\+\=\_\(\)\[\]\<\>\@\?]/ig,"-");
      tags[stripedTag] = tag;
      if(graph["enhancer:entity-type"]){
        for(var gid in graph["enhancer:entity-type"]){
          var group = graph["enhancer:entity-type"][gid];
          if(group.indexOf("dbp-ont:") > -1){
            var groupName = group.replace(/dbp-ont\:/, "")
            groupedTags[groupName] = groupedTags[groupName] || {};
            groupedTags[groupName][stripedTag] = tag;
          }
        }
      }
     }
    }
  }
  return {tags: tags, groupedTags: groupedTags};
}

io.on('connection', function (socket) {
  socket.on("stanbol", function(data, callback){
    var options = {
      url: process.env.STANBOL_URL,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'text/plain'
      },
      body: data.text
    };

    request.post(options,function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var data = proccessData(info);
        callback(data);
      }else{
        console.log({error: error});
      }
    });
  });
});