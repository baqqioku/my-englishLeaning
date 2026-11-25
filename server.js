var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');

var PORT = 3001;
var DIR = path.join(__dirname, 'src');

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

var nets = os.networkInterfaces();
var localIP = '127.0.0.1';
for (var name in nets) {
  for (var i = 0; i < nets[name].length; i++) {
    var addr = nets[name][i];
    if (addr.family === 'IPv4' && !addr.internal) {
      localIP = addr.address;
    }
  }
}

http.createServer(function(req, res) {
  var url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  var fp = path.join(DIR, decodeURIComponent(url));
  fs.readFile(fp, function(err, data) {
    if (err) { res.writeHead(404); res.end('Not Found: ' + url); return; }
    var ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', function() {
  console.log('=====================================');
  console.log('  3153 Vocabulary App Running!');
  console.log('  PC:   http://localhost:' + PORT);
  console.log('  Phone: http://' + localIP + ':' + PORT);
  console.log('=====================================');
});
