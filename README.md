# lc-auth

A lightweight, zero-dependency authentication library for Node.js, supporting local credentials, OAuth, and both stateful (database-backed) and stateless (JWT-based) session strategies. Built with TypeScript for type safety and modern Node.js applications.

## Features

- Local Authentication: Register and log in users with username and password.
- OAuth Support: Integrate third-party logins (e.g., Google, Facebook).
- Session Strategies:
- Stateful: Store sessions in a user-provided database.
- Stateless: Use JSON Web Tokens (JWT) for session management.
- Zero Dependencies: Relies only on Node.js built-in modules (e.g., crypto, https).
- TypeScript Support: Includes type definitions for a better developer experience.
- Framework Agnostic: Works with any Node.js framework or vanilla Node.js.

## Installation

Install lc-auth via npm:

```
npm install lc-auth
```

NOTE: Ensure you’re using Node.js 14 or higher, as the library leverages modern Node.js features.

## Quick Start

# 1. Local Authentication with Stateless Sessions (JWT)

This example shows how to set up lc-auth with stateless sessions using JWT in a vanilla Node.js HTTP server.

```
import { createServer } from 'http';
import { parse } from 'url';
import { AuthLibrary, AuthConfig } from 'lc-auth';

// Simple request body parser (for demo purposes)
async function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(JSON.parse(body || '{}')));
    });
}

const authConfig = {
    strategy: 'stateless',
    jwtSecret: 'my-very-secure-secret' // Replace with a secure secret in production
};

const auth = new AuthLibrary(authConfig);

const server = createServer(async (req, res) => {
    const { pathname } = parse(req.url, true);
    res.setHeader('Content-Type', 'application/json');

    // Register a user (you must handle storage)
    if (req.method === 'POST' && pathname === '/register') {
        const { username, password } = await parseBody(req);
        try {
            const user = await auth.register(username, password);
            // Save user to your database here
            const token = await auth.createSession(user.id);
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Registered', token }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Registration failed' }));
        }
        return;
    }

    // Login a user
    if (req.method === 'POST' && pathname === '/login') {
        const { username, password } = await parseBody(req);
        const user = await auth.login(username, password);
        if (user) {
            const token = await auth.createSession(user.id);
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Logged in', token }));
        } else {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
        return;
    }

    // Protected route
    if (req.method === 'GET' && pathname === '/profile') {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Unauthorized: No token provided' }));
            return;
        }
        const userId = await auth.verifySession(token);
        if (!userId) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Unauthorized: Invalid token' }));
            return;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Protected route', userId }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => console.log('Server running on port 3000'));
```

### Notes:

The **verifySession** method checks the JWT provided in the **Authorization: Bearer <token>** header.
Since this is stateless, you must handle user storage (e.g., in a database) yourself.

# 2. Local Authentication with Stateful Sessions

This example uses a database to store sessions.

```
import { createServer } from 'http';
import { parse } from 'url';
import { AuthLibrary, AuthConfig, Database } from 'lc-auth';

// Simple request body parser (for demo purposes)
async function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(JSON.parse(body || '{}')));
    });
}

// Implement your database (e.g., MongoDB, SQLite)
const db = {
    async findUserByUsername(username) {
        // Replace with real database lookup
        return username === 'testuser' ? { id: '1', username: 'testuser', passwordHash: 'hashedPassword' } : null;
    },
    async createUser(user) {
        console.log('User created:', user);
    },
    async saveSession(sessionId, data) {
        console.log('Session saved:', sessionId, data);
    },
    async getSession(sessionId) {
        return sessionId === 'validSession' ? { userId: '1', expires: Date.now() + 3600000 } : null;
    }
};

const authConfig = {
    strategy: 'stateful',
    database: db
};

const auth = new AuthLibrary(authConfig);

const server = createServer(async (req, res) => {
    const { pathname, query } = parse(req.url, true);
    res.setHeader('Content-Type', 'application/json');

    // Register a user
    if (req.method === 'POST' && pathname === '/register') {
        const { username, password } = await parseBody(req);
        try {
            const user = await auth.register(username, password);
            const sessionId = await auth.createSession(user.id);
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Registered', userId: user.id }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Registration failed' }));
        }
        return;
    }

    // Login a user
    if (req.method === 'POST' && pathname === '/login') {
        const { username, password } = await parseBody(req);
        const user = await auth.login(username, password);
        if (user) {
            const sessionId = await auth.createSession(user.id);
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Logged in', userId: user.id }));
        } else {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
        return;
    }

    // Protected route
    if (req.method === 'GET' && pathname === '/profile') {
        const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        const sessionId = cookies?.sessionId;
        if (!sessionId) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Unauthorized: No session ID' }));
            return;
        }
        const userId = await auth.verifySession(sessionId);
        if (!userId) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Unauthorized: Invalid session' }));
            return;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Protected route', userId }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => console.log('Server running on port 3000'));
```

### Notes:

The **verifySession** method checks the session ID provided in a cookie named **sessionId**.
You must implement the **Database** interface for session and user storage.

# 3. OAuth Integration (e.g., Google)

This example integrates Google OAuth for third-party login.

```
import { createServer } from 'http';
import { parse } from 'url';
import { AuthLibrary, AuthConfig } from 'lc-auth';

// Simple request body parser (for demo purposes)
async function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(JSON.parse(body || '{}')));
    });
}

const authConfig = {
    strategy: 'stateless',
    jwtSecret: 'my-very-secure-secret',
    oauth: {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: 'your-google-client-id',
        clientSecret: 'your-google-client-secret',
        redirectUri: 'http://localhost:3000/auth/google/callback',
        scope: 'profile email'
    }
};

const auth = new AuthLibrary(authConfig);

const server = createServer(async (req, res) => {
    const { pathname, query } = parse(req.url, true);
    res.setHeader('Content-Type', 'application/json');

    // Redirect to Google OAuth
    if (req.method === 'GET' && pathname === '/auth/google') {
        const state = 'randomstate123'; // Should be unique per request
        const url = auth.getOAuthUrl(state);
        res.writeHead(302, { Location: url });
        res.end();
        return;
    }

    // Handle OAuth callback
    if (req.method === 'GET' && pathname === '/auth/google/callback') {
        const { code } = query;
        try {
            const tokenResponse = await auth.exchangeOAuthCode(code);
            const { access_token } = JSON.parse(tokenResponse);
            // Fetch user info (implement this)
            const userInfo = await fetchUserInfo(access_token);
            const userId = userInfo.id; // Map to your user system
            const token = await auth.createSession(userId);
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Logged in via Google', token }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'OAuth failed' }));
        }
        return;
    }

    // Protected route
    if (req.method === 'GET' && pathname === '/profile') {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Unauthorized: No token provided' }));
            return;
        }
        const userId = await auth.verifySession(token);
        if (!userId) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Unauthorized: Invalid token' }));
            return;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Protected route', userId }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => console.log('Server running on port 3000'));

async function fetchUserInfo(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.json();
}
```

### Notes:

- Register with Google Cloud Console to get clientId and clientSecret.
- Implement fetchUserInfo to map OAuth user data to your system.

## Configuration Options

The **AuthLibrary** constructor accepts an **AuthConfig** object:

```
interface AuthConfig {
    strategy: 'stateful' | 'stateless'; // Session strategy
    database?: Database; // Required for stateful strategy
    jwtSecret?: string; // Required for stateless strategy
    oauth?: OAuthProviderConfig; // Optional for OAuth
}
```

## Database Interface (for Stateful Strategy)

You must implement the following interface for stateful sessions:

```
interface Database {
    findUserByUsername(username: string): Promise<User | null>;
    createUser(user: User): Promise<void>;
    saveSession(sessionId: string, data: object): Promise<void>;
    getSession(sessionId: string): Promise<object | null>;
}
```

## OAuth Provider Configuration

For OAuth, provide the following configuration:

```
interface OAuthProviderConfig {
    authUrl: string; // e.g., 'https://accounts.google.com/o/oauth2/auth'
    tokenUrl: string; // e.g., 'https://oauth2.googleapis.com/token'
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string; // e.g., 'profile email'
}
```

## Security Considerations

- HTTPS: Always use HTTPS in production to secure tokens and cookies.
- Secrets: Store **jwtSecret** in environment variables, not in code.
- Cookies: For stateful sessions, set **HttpOnly** and **Secure** flags on cookies.
- OAuth: Validate redirect URIs and use secure state parameters to prevent CSRF.
- Password Hashing: The library uses **crypto.scryptSync** for secure password hashing.

## Limitations

- **Zero Dependencies**: You must handle HTTP requests (e.g., for OAuth user info) and database operations yourself.
- **Refresh Tokens**: Not implemented; you can extend the library to add refresh token support using the JWT utilities.
- **Framework Integration**: The library is framework-agnostic; you must implement middleware or route handlers for your framework.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue on the GitHub repository. `https://github.com/caoh29/lc-auth`

## License

MIT License. See **LICENSE** for details.

## Author

Built by Camilo Ordonez as of March 20, 2025.
