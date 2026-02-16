# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by email to:

**security@vollcomdigital.com**

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the manifestation of the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will send you a more detailed response within 5 business days indicating the next steps
- We will keep you informed about the progress towards a fix and announcement
- We may ask for additional information or guidance

## Security Best Practices for Deployment

### Environment Variables

**CRITICAL:** Never use default or placeholder secrets in production:

- `SESSION_SECRET` must be cryptographically random (min 32 characters)
- All `STRAPI_*` secrets must be unique, random values
- Database connection strings must use strong authentication
- API keys and tokens must be rotated regularly

### Kubernetes Deployments

1. **Use Kubernetes Secrets** - Never hardcode sensitive values in Helm values
2. **Enable RBAC** - Apply principle of least privilege
3. **Network Policies** - Restrict pod-to-pod communication
4. **Security Contexts** - Run containers as non-root with read-only filesystems
5. **Image Scanning** - Scan container images for vulnerabilities before deployment

### Application Security

1. **Rate Limiting** - Enabled on all API endpoints
2. **Input Validation** - All request bodies validated with Zod schemas
3. **CORS** - Properly configured allowed origins
4. **Helmet** - Security headers enabled with strict CSP
5. **Session Security** - HttpOnly, Secure, SameSite cookies

## Security Scanning

This repository uses automated security scanning:

- **Dependabot** - Automatic dependency vulnerability detection
- **CodeQL** - Static application security testing (SAST)
- **SonarQube** - Continuous code quality and security analysis
- **Docker Image Scanning** - Base image vulnerability detection

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new security patch versions as soon as possible

## Security Contact

For security-related questions or concerns, contact:

**Email:** security@vollcomdigital.com  
**PGP Key:** Available on request
