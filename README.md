# Linear Webhook Server

A simple Express.js server that receives webhook events from Linear.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file in the root directory with the following variables

```bash
SLACK_TOKEN=
SLACK_DEFAULT_CHANNEL=
PORT=3000
LOG_WEBHOOK=TRUE
MAIN_USER=
OTHER_USERS=
```

### 3. Start the server

```bash
npm run dev
```

### Webhook Endpoint

The webhook endpoint is available at:

```bash
POST /webhook/linear
```

#### Headers

- `linear-signature`: The signature of the webhook payload (provided by Linear)

#### Response

- Returns a 200 status code with `{ received: true }` when the webhook is successfully received

### Health Check

A health check endpoint is available at:

```bash
GET /health
```

### Security Note

This is a basic implementation. In a production environment, you should:

1. Implement proper signature verification using the Linear webhook secret
2. Use HTTPS
3. Add rate limiting
4. Add proper error handling
5. Add logging
6. Add proper security headers

### Linear Webhook Setup

1. Go to your Linear workspace settings
2. Navigate to the Webhooks section
3. Add a new webhook with your server's URL (e.g., `https://your-domain.com/webhook/linear`)
4. Copy the webhook secret and add it to your `.env` file
