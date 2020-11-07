const http = require('http');
const request = require('request');
const uuid = require('uuid');

const PORT = 3000;

const getRandomDog = (callback) => {
  request('https://dog.ceo/api/breeds/image/random', function (error, response, body) {
    const result = JSON.parse(body);
    callback(result.message);
  });
}

const get30dogs = (callback) => {
  const dogsArr = [];

  const ourRequest = (index) => {
    const currentTime = Date.now();
    request('https://dog.ceo/api/breeds/image/random', function (error, response, body) {
      const result = JSON.parse(body);
      const dog = {
        id: uuid.v4(),
        url: result.message,
        uploadTime: Date.now(),
        breed: result.message.match(/((?<=breeds\/).+(?=\/))/gi)[0]
      }
      request(result.message, function (err, res, body) {
        const resultTime = Date.now() - currentTime;
        const size = Buffer.byteLength(body);
        dogsArr.push({
          ...dog,
          resultTime,
          size
        });
        if (
          index < 29
        ) {
          ourRequest(index + 1)
        } else {
          callback(dogsArr);
        }
      });
    });
  }

  ourRequest(0);
}

const server = http.createServer((req, res) => {
  if (
    req.method === 'GET'
  ) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });

    let content = `
      <style>
      @import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@500;700&display=swap");
        body {
          margin: 80px 0 0 0;
        }
        * {
          font-family: Ubuntu, sans-serif;
        }
        .link {
          border: 2px solid #000;
          background: none;
          text-decoration: none;
          border-radius: 6px;
          width: 240px;
          height: 60px;
          margin: 0 auto 40px auto;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #000;
          text-transform: uppercase;
        }

        .link:active {
          background: #f8f8f8;
        }

        .img {
          display: block;
          margin: 0 auto;
          max-width: 60vw;
        }
      </style>
      <a href="/get30" class="link">Get 30 dogs</a>
      <a href="/getdog" class="link">Get random dog</a>
    `;
    if (
      req.url === '/getdog'
    ) {
      getRandomDog((url) => {
        content += `<img src="${url}" class="img" alt="random-dog">`
        res.end(content);
      })
    } else if (
      req.url === '/get30'
    ) {
      get30dogs((arr) => {
        const result = arr.sort((a, b) => a.resultTime - b.resultTime);
        console.table(result);
        res.end(content);
      })
    } else {
      res.end(content);
    }
  }
});

server.listen(PORT, () => {
  console.log('server is running on port ' + PORT + '...')
});
