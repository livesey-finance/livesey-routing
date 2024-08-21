<a name="readme-top"></a>
# livesey-routing

This module is a lightweight HTTP router that facilitates handling requests and responses in a Node.js application. It offers tools to manage HTTP methods, URL parameters, request bodies, and custom routes.

## Table of Contents
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
- [Features](#features)
  - [Request Class](#request-class)
  - [Response Class](#response-class)
  - [Routing](#routing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Getting Started

### Installation

You can install the module via npm:

```bash
npm install livesey-routing
```

## Usage
To use the module in your project:
```js
import http from 'http';
import { Router, RouteBuilder } from 'livesey-routing';

const routeBuilder = new RouteBuilder();

routeBuilder
  .get('/hello/:name', (req, res) => {
    const name = req.params.name;
    res.json({ message: `Hello, ${name}!` });
  })
  .post('/data', async (req, res) => {
    const data = await req.getBody();
    res.json({ received: data });
  })
  .build();

(async () => {
  const server = http.createServer((req, res) => {
    router.handleRequest(req, res);
  });
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
})();
```

## Features
### Request Class

The `Request` class provides methods to handle and parse incoming HTTP requests.

```js
import { Request } from 'livesey-routing';

const request = new Request(req);

// Access query parameters
const params = request.getParams();

// Access request body
const body = await request.getBody();
```


### Response Class

The `Response` class simplifies sending responses to the client.

```js
import { Response } from 'livesey-routing';

const response = new Response(res);

// Send a JSON response
response.json({ message: 'Success' });

// Send a plain text response
response.send('Hello, world!');

// Set status code
response.status(404).send('Not Found');
```

### Routing

Routing allows you to define custom routes and their associated handlers.

```js
import { RouteBuilder } from 'livesey-routing';

const routeBuilder = new RouteBuilder();

routeBuilder
  .get('/user/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ userId });
  })
  .post('/submit', async (req, res) => {
    const data = await req.getBody();
    res.json({ received: data });
  });
  .build();
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License.s

## Contact

For any questions or inquiries, please contact huziukwork@gmail.com.

<p align="right">(<a href="#readme-top">back to top</a>)</p>