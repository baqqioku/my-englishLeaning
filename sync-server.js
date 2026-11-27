var http = require('http');
var path = require('path');
var Database = require('better-sqlite3');

var PORT = process.env.SYNC_PORT || 3002;
var DB_PATH = process.env.SYNC_DB || path.join(__dirname, 'progress.sqlite');
var TOKEN = process.env.SYNC_TOKEN || 'vocab3153-sync-token';

var db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec('CREATE TABLE IF NOT EXISTS progress (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at INTEGER NOT NULL)');

var getStmt = db.prepare('SELECT data, updated_at FROM progress WHERE id = 1');
var upsertStmt = db.prepare('INSERT INTO progress (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at');

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Sync-Token'
  });
  res.end(JSON.stringify(obj));
}

function readBody(req, cb) {
  var chunks = [];
  var size = 0;
  req.on('data', function(chunk) {
    size += chunk.length;
    if (size > 1024 * 1024 * 5) { cb(new Error('payload too large')); req.destroy(); return; }
    chunks.push(chunk);
  });
  req.on('end', function() { cb(null, Buffer.concat(chunks).toString('utf8')); });
  req.on('error', function(err) { cb(err); });
}

http.createServer(function(req, res) {
  var url = req.url.split('?')[0];

  if (req.method === 'OPTIONS') { send(res, 204, {}); return; }

  if (url === '/api/health' && req.method === 'GET') {
    send(res, 200, { ok: true, service: 'vocab3153-sync', time: Date.now() });
    return;
  }

  if (req.headers['x-sync-token'] !== TOKEN) {
    send(res, 401, { ok: false, error: 'invalid token' });
    return;
  }

  if (url === '/api/progress' && req.method === 'GET') {
    var row = getStmt.get();
    if (!row) { send(res, 200, { ok: true, learned: {}, updatedAt: 0 }); return; }
    try {
      send(res, 200, { ok: true, learned: JSON.parse(row.data), updatedAt: row.updated_at });
    } catch (e) {
      send(res, 500, { ok: false, error: 'corrupted data' });
    }
    return;
  }

  if (url === '/api/progress' && req.method === 'POST') {
    readBody(req, function(err, raw) {
      if (err) { send(res, 400, { ok: false, error: err.message }); return; }
      var data;
      try { data = JSON.parse(raw); } catch (e) { send(res, 400, { ok: false, error: 'invalid json' }); return; }
      if (!data.learned || typeof data.learned !== 'object' || Array.isArray(data.learned)) {
        send(res, 400, { ok: false, error: 'learned must be an object' });
        return;
      }
      var now = Date.now();
      upsertStmt.run(JSON.stringify(data.learned), now);
      send(res, 200, { ok: true, updatedAt: now });
    });
    return;
  }

  send(res, 404, { ok: false, error: 'not found' });
}).listen(PORT, '0.0.0.0', function() {
  console.log('Sync server running on port ' + PORT);
  console.log('SQLite: ' + DB_PATH);
});
