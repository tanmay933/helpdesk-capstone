# DevSecOps Controls

The capstone uses layered security gates:

- **SAST:** GitHub CodeQL analyzes Python and JavaScript/TypeScript source.
- **SCA:** `pip-audit` checks Python dependencies and `npm audit` checks frontend dependencies.
- **Secret scanning:** Gitleaks scans the repository for accidentally committed credentials.
- **Container scanning:** Trivy scans both Docker images for HIGH/CRITICAL vulnerabilities.
- **Security gates:** the workflow uses non-zero exit codes so failures stop promotion/push.

No cloud credentials are stored in the repository. Runtime/deployment credentials belong in GitHub Secrets or the cluster's secret management mechanism.
