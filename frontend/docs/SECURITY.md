# Security Configuration

**Last Updated:** 2026-01-09

---

## Password Hashing

### Configuration

**Library:** Better Auth → oslo → `@node-rs/bcrypt` v1.9.0 (Rust implementation)
**Algorithm:** bcrypt
**Cost Factor:** 10 (default, not configurable without forking)
**Time per hash:** ~100-150ms

### Security Analysis

**Why bcrypt?**
- Industry standard for password hashing
- Adaptive (cost can increase as hardware improves)
- Salt automatically generated and stored
- Resistant to brute force attacks

**Why cost factor 10?**
- OWASP recommended minimum
- Balances security and user experience
- Makes brute force attacks impractical:
  - 1 password attempt = 100ms
  - 1 million attempts = 27+ hours
  - 1 billion attempts = 3+ years

**Cost Factor Trade-offs:**
| Factor | Time | Security | UX | Production Ready |
|--------|------|----------|-----|------------------|
| 8 | 25ms | Weak | Excellent | ❌ No |
| 9 | 50ms | Below standard | Good | ❌ No |
| **10** | **100ms** | **OWASP minimum** | **Good** | **✅ Yes** |
| 11 | 200ms | More secure | Acceptable | ⚠️ Consider |
| 12 | 400ms | Very secure | Poor | ❌ No |

### Performance Impact

**Registration:**
- Total time: ~300-700ms (production)
- Password hashing: ~100-150ms (43% of total)
- Database operations: ~150-400ms
- Other overhead: ~50-150ms

**Login:**
- Total time: ~200-400ms (production)
- Password verification: ~100-150ms (50% of total)
- Database lookup: ~50-100ms
- JWT generation: ~10-50ms

**Why we CANNOT reduce hashing time:**
- Lowering cost = weaker security
- Cost 10 is already MINIMUM recommended
- Any further optimization would compromise security

### Recommendations

✅ **DO:**
- Keep cost factor 10 (Better Auth default)
- Accept 100-150ms as necessary overhead
- Focus on optimizing database operations instead

❌ **DO NOT:**
- Reduce cost factor below 10
- Fork Better Auth to weaken hashing
- Use faster but weaker algorithms (MD5, SHA1, etc.)

---

## Connection Security

### SSL/TLS Configuration

**Database Connection:**
```typescript
// Connection pool SSL config
ssl: process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }  // Verify cert in prod
  : { rejectUnauthorized: false } // Allow self-signed in dev
```

**Why this configuration?**
- **Production:** Full certificate validation (prevents MITM attacks)
- **Development:** Allow self-signed certs (for local PostgreSQL)

### Session Security

**JWT Configuration:**
```typescript
session: {
  expiresIn: 60 * 60, // 1 hour
  strategy: "jwt",
}

advanced: {
  useSecureCookies: process.env.NODE_ENV === "production",
  cookiePrefix: "better_auth",
}
```

**Security Properties:**
- **JWT:** Stateless, cannot be revoked (use short expiration)
- **Database session:** Can be revoked, but requires DB lookup
- **Hybrid approach:** JWT for API auth, DB for session management
- **Secure cookies:** httpOnly, secure flag in production

---

## Environment Variables

### Critical Secrets

**DO NOT COMMIT:**
```bash
BETTER_AUTH_SECRET=<32-byte-base64-secret>
DATABASE_URL=postgresql://user:pass@host/db
```

**Generate secure secret:**
```bash
# Generate 32-byte random secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Secret Requirements:**
- Minimum 32 bytes (256 bits)
- Cryptographically random
- Same secret in frontend AND backend
- Different secret per environment (dev, staging, prod)

---

## Database Security

### Connection String

**Format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Security Considerations:**
1. **sslmode=require:** Force SSL/TLS encryption
2. **Credentials:** Use environment variables, never hardcode
3. **Least privilege:** Use database user with minimal permissions
4. **Connection limit:** Pool prevents connection exhaustion attacks

### User Permissions

**Better Auth requires:**
- `SELECT` on users, session, account, verification tables
- `INSERT` on users, session, account, verification tables
- `UPDATE` on users, session tables (last login, email verification)
- `DELETE` on session, account, verification tables (logout, cleanup)

**NOT required:**
- `DROP` (tables created manually or via migration)
- `CREATE` (schema managed separately)
- `ALTER` (schema changes via migration)

---

## Input Validation

### Email Validation

Better Auth validates:
- Email format (RFC 5322)
- Email uniqueness (database constraint)
- Email max length (254 characters)

### Password Validation

Better Auth validates:
- Minimum length: 8 characters (default)
- Maximum length: 72 bytes (bcrypt limit)
- No character restrictions (allows Unicode)

**Recommendations:**
```typescript
// In registration form
if (password.length < 8) {
  setError("Password must be at least 8 characters");
  return;
}

// Optional: Add strength requirements
if (!/[A-Z]/.test(password)) {
  setError("Password must contain uppercase letter");
}
if (!/[0-9]/.test(password)) {
  setError("Password must contain number");
}
```

---

## Rate Limiting

### Current Status

⚠️ **NOT IMPLEMENTED**

### Recommendations

**Production deployment should include:**

1. **API Route Rate Limiting**
```typescript
// middleware.ts
import { RateLimiter } from '@/lib/rate-limiter';

const limiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
});

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/auth/sign-up')) {
    const ip = request.ip ?? 'unknown';
    if (!limiter.check(ip)) {
      return new Response('Too many attempts', { status: 429 });
    }
  }
}
```

2. **Database-Level Rate Limiting**
```sql
-- Track failed login attempts
CREATE TABLE login_attempts (
  ip_address TEXT,
  email TEXT,
  attempted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (ip_address, email, attempted_at)
);

-- Lock account after 5 failed attempts
CREATE INDEX idx_login_attempts_email ON login_attempts(email, attempted_at);
```

---

## Security Checklist

Before production deployment:

### Authentication
- [x] Password hashing with bcrypt cost 10
- [x] SSL/TLS enabled for database connection
- [x] Secure JWT secret (32+ bytes)
- [x] httpOnly secure cookies in production
- [x] Session expiration (1 hour)
- [ ] Rate limiting (registration, login)
- [ ] Email verification (optional)
- [ ] Two-factor authentication (optional)

### Database
- [x] SSL required for connections
- [x] Credentials in environment variables
- [x] Connection pooling configured
- [ ] Database user with least privilege
- [ ] Audit logging enabled
- [ ] Automated backups configured

### Application
- [x] Environment secrets not committed
- [x] Production env separate from development
- [ ] CORS configured for production domain
- [ ] CSP headers configured
- [ ] HTTPS enforced (Vercel handles this)

---

## Incident Response

### Compromised Secret

If `BETTER_AUTH_SECRET` is compromised:

1. **Immediate:**
   - Generate new secret
   - Deploy with new secret
   - Invalidate all existing sessions

2. **Follow-up:**
   - Audit access logs
   - Force password reset for affected users
   - Review commit history for exposure

### Database Breach

If database credentials are compromised:

1. **Immediate:**
   - Rotate database password
   - Update `DATABASE_URL` in all environments
   - Review database logs for unauthorized access

2. **Follow-up:**
   - Force password reset for all users
   - Invalidate all sessions
   - Audit for data exfiltration
   - Notify affected users (GDPR/CCPA compliance)

---

**Document Version:** 1.0
**Last Reviewed:** 2026-01-09
**Next Review:** Before production deployment
