import { strict as assert } from 'node:assert';
import http from 'node:http';
import { Request } from '../src/request/request.js';
import { Response } from '../src/response/response.js';
import { RouteBuilder } from '../src/router/router.js';

const runTests = async () => {
  // Test Request class
  const mockReq = new http.IncomingMessage();
  mockReq.method = 'GET';
  mockReq.url = '/test/123?query=1';
  mockReq.headers = { host: 'localhost', 'content-type': 'application/json' };

  const request = new Request(mockReq);

  // Test Request properties
  assert.strictEqual(request.method, 'GET');
  assert.strictEqual(request.url, '/test/123?query=1');
  assert.strictEqual(request.path, '/test/123');
  assert.strictEqual(request.headers.host, 'localhost');
  console.log('✔️ Request properties test passed.');

  // Test extractParams
  const params = request.extractParams('/test/:id');
  assert.deepStrictEqual(params, { id: '123' });
  console.log('✔️ Request extractParams test passed.');

  // Test parseBody method
  const bodyReq = new http.IncomingMessage();
  bodyReq.headers = { 'content-type': 'application/json' };
  bodyReq.push('{"key":"value"}');
  bodyReq.push(null); // Signal end of body
  const bodyRequest = new Request(bodyReq);
  const parsedBody = await bodyRequest.parseBody();
  assert.deepStrictEqual(parsedBody, { key: 'value' });
  console.log('✔️ Request parseBody test passed.');

  // Test Response class
  const mockRes = {
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(data) {
      this.body = data;
    },
    statusCode: 200,
    headers: {},
    body: null,
  };

  const response = new Response(mockRes);

  // Test sending plain text response
  response.send('Hello, World!');
  assert.strictEqual(mockRes.body, 'Hello, World!');
  assert.strictEqual(mockRes.headers['Content-Type'], 'text/plain');
  console.log('✔️ Response send plain text test passed.');

  // Test sending JSON response
  response.json({ success: true });
  assert.strictEqual(mockRes.body, JSON.stringify({ success: true }));
  assert.strictEqual(mockRes.headers['Content-Type'], 'application/json');
  console.log('✔️ Response send JSON test passed.');

  // Test status method
  response.status(404).send('Not Found');
  assert.strictEqual(mockRes.statusCode, 404);
  assert.strictEqual(mockRes.body, 'Not Found');
  console.log('✔️ Response status test passed.');

  // Test Router and Route classes
  const router = new RouteBuilder()
    .get('/test/:id', (req, res) => {
      res.json({ id: req.params.id });
    })
    .post('/test', (req, res) => {
      res.json({ message: 'Post request received' });
    })
    .put('/test/:id', (req, res) => {
      res.json({ message: `Put request received for id ${req.params.id}` });
    })
    .delete('/test/:id', (req, res) => {
      res.json({ message: `Delete request received for id ${req.params.id}` });
    })
    .build();

  const testCases = [
    {
      method: 'GET',
      url: '/test/123',
      expectedStatusCode: 200,
      expectedBody: JSON.stringify({ id: '123' }),
      expectedContentType: 'application/json',
    },
    {
      method: 'POST',
      url: '/test',
      expectedStatusCode: 200,
      expectedBody: JSON.stringify({ message: 'Post request received' }),
      expectedContentType: 'application/json',
    },
    {
      method: 'PUT',
      url: '/test/123',
      expectedStatusCode: 200,
      expectedBody: JSON.stringify({ message: 'Put request received for id 123' }),
      expectedContentType: 'application/json',
    },
    {
      method: 'DELETE',
      url: '/test/123',
      expectedStatusCode: 200,
      expectedBody: JSON.stringify({ message: 'Delete request received for id 123' }),
      expectedContentType: 'application/json',
    },
  ];

  for (const testCase of testCases) {
    const mockServerReq = new http.IncomingMessage();
    mockServerReq.method = testCase.method;
    mockServerReq.url = testCase.url;
    mockServerReq.headers = { host: 'localhost' };

    const mockServerRes = {
      setHeader(key, value) {
        this.headers[key] = value;
      },
      end(data) {
        this.body = data;
      },
      statusCode: 200,
      headers: {},
      body: null,
    };

    // Simulate handling the request
    router.handleRequest(mockServerReq, mockServerRes);

    assert.strictEqual(mockServerRes.statusCode, testCase.expectedStatusCode);
    assert.strictEqual(mockServerRes.body, testCase.expectedBody);
    assert.strictEqual(mockServerRes.headers['Content-Type'], testCase.expectedContentType);
    console.log(`✔️ Router ${testCase.method} request handling test passed.`);
  }

  // Test for 404 response
  const mock404Req = new http.IncomingMessage();
  mock404Req.method = 'GET';
  mock404Req.url = '/unknown';
  mock404Req.headers = { host: 'localhost' };

  const mock404Res = {
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(data) {
      this.body = data;
    },
    statusCode: 200,
    headers: {},
    body: null,
  };

  router.handleRequest(mock404Req, mock404Res);

  assert.strictEqual(mock404Res.statusCode, 404);
  assert.strictEqual(mock404Res.body, 'Not Found');
  console.log('✔️ Router 404 handling test passed.');
};

// Run the tests
runTests();
