This is an Auth library with zero dependencies and stateful or stateless strategy supporting both credentials and oauth integrations

# Folder Structure

├── src/ # Source code in TypeScript
│ ├── core/ # Core utilities (hashing, JWT)
│ │ ├── crypto.ts # Password hashing and JWT functions
│ │ └── types.ts # Shared TypeScript interfaces/types
│ ├── strategies/ # Authentication strategies
│ │ ├── local.ts # Credentials-based auth
│ │ ├── oauth.ts # OAuth logic
│ │ ├── stateful.ts # Stateful session management
│ │ └── stateless.ts # Stateless (JWT) management
│ └── index.ts # Entry point, exports all public APIs
├── tests/ # Unit and integration tests
│ ├── core.test.ts # Tests for crypto utilities
│ └── strategies.test.ts # Tests for auth strategies
├── dist/ # Compiled JS and type definitions (gitignored)
│ ├── index.js
│ ├── index.d.ts
│ └── ... # Other compiled files
├── .gitignore # Ignore node_modules, dist, etc.
├── package.json # npm metadata
├── tsconfig.json # TypeScript config
└── README.md # Documentation
