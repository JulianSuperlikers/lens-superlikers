<img src="https://s3.amazonaws.com/superlikers-production/beta/icon_login.6255d6c87f6f9b1f.png" width="200">

This is a Node.js's Express server to validate invoices using [Veryfi api](https://docs.veryfi.com/).

Install dependencies:

```
npm install
```

To start project on port 5001:

```
npm start
```

To watch change on port 5001:

```
npm run dev
```

To change classes run:

```
npx tailwindcss -i ./public/input.css -o ./public/css/output.css --watch
```

To use a proxy run:

```
npx local-ssl-proxy --key localhost-key.pem --cert localhost.pem --source 3001 --target 5001
```

```
ngrok http 5001
```
