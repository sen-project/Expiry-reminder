const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/medicine/list?userId=1&page=1&pageSize=30&type=&expiryStatus=',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3MzA1MDIwNywiZXhwIjoxNzczMTM2NjA3fQ.T4igDAx6622LIltyQrAB8YSE1tNSlWsET7lQhKJOJOQ'
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`响应体: ${chunk}`);
  });
  res.on('end', () => {
    console.log('响应结束');
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.end();