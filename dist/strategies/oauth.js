"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth = void 0;
const https_1 = require("https");
class OAuth {
    constructor(config) {
        this.config = config;
    }
    getAuthUrl(state) {
        return `${this.config.authUrl}?client_id=${this.config.clientId}&redirect_uri=${this.config.redirectUri}&scope=${this.config.scope}&state=${state}&response_type=code`;
    }
    async exchangeCode(code) {
        const body = `grant_type=authorization_code&code=${code}&redirect_uri=${this.config.redirectUri}&client_id=${this.config.clientId}&client_secret=${this.config.clientSecret}`;
        return new Promise((resolve, reject) => {
            const req = (0, https_1.request)(this.config.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
}
exports.OAuth = OAuth;
