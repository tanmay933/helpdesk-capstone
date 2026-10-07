# Session 21 — HelpDesk DevOps Final Capstone

HelpDesk is a customer-support ticketing application (create, assign, prioritise and resolve tickets) used to demonstrate an end-to-end DevOps lifecycle: development, version control, automated testing, DevSecOps, containerization, cloud infrastructure, Kubernetes, Helm, observability, GitOps, and troubleshooting.

## Architecture

```text
User
  |
  v
React + Nginx (frontend)
  | /api
  v
FastAPI (backend)
  |
  v
PostgreSQL

GitHub -> Actions -> GHCR -> Helm -> Kubernetes/EKS
                              |
                              +-> Prometheus -> Grafana
                              +-> Argo CD (GitOps)
```


```text
                         GitHub Repository
                                |
                                v
                     GitHub Actions CI/CD
             +------------------+------------------+
             |                  |                  |
           Pytest              SAST/SCA        Secret Scan
        Frontend Build          CodeQL           Gitleaks
             |                  |                  |
             +------------------+------------------+
                                |
                         Docker Build
                                |
                         Trivy Security Gate
                                |
                         Push to GHCR
                                |
                    +-----------+-----------+
                    |                       |
                 Terraform               GitOps
                    |                       |
             AWS VPC + EKS             Argo CD
                    |                       |
                    +-----------+-----------+
                                |
                         Kubernetes / Helm
                                |
             +------------------+------------------+
             |                  |                  |
          Frontend            Backend          PostgreSQL
          React/Nginx         FastAPI           Persistent
             |                  |                Volume
             +-------- Ingress -+----------------+
                                |
                      Prometheus + Grafana
```

## Technologies

- Frontend: React, Vite, Nginx
- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL
- Testing: Pytest
- Containers: Docker, Docker Compose
- Registry: GitHub Container Registry
- CI/CD: GitHub Actions
- DevSecOps: CodeQL, pip-audit, npm audit, Gitleaks, Trivy
- Infrastructure: Terraform, AWS VPC, Amazon EKS
- Kubernetes: Deployments, Services, ConfigMap, Secret, Ingress, HPA, probes, PVC
- Packaging: Helm
- Observability: Prometheus, Grafana, application metrics
- GitOps: Argo CD

## Project Structure

```text
session21-python/
├── frontend/                 # React/Vite application
├── backend/                  # FastAPI API, tests and migrations
├── docker-compose.yml        # Local full-stack environment
├── terraform/                # AWS VPC + EKS infrastructure
├── helm/helpdesk/           # Helm chart for Kubernetes
├── k8s/                      # Kubernetes bootstrap resources
├── monitoring/               # Prometheus/Grafana configuration
├── security/                 # Security controls and dependency scan helper
├── gitops/                   # Argo CD application definition
├── troubleshooting/          # Intentionally broken resources + investigation guide
├── scripts/                  # Load-testing helper
├── .github/workflows/        # CI/CD pipeline
└── README.md
```

## Application

The backend exposes:

```text
GET    /health
GET    /ready
GET    /metrics
GET    /api/tickets
GET    /api/tickets/{id}
POST   /api/tickets
PUT    /api/tickets/{id}
DELETE /api/tickets/{id}
GET    /api/tickets/stats
```

The application uses PostgreSQL through SQLAlchemy and Alembic migrations. `/health` is used for liveness, while `/ready` checks database readiness.

## Local Docker Setup

Requirements: Docker Desktop / Docker Engine with Compose.

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000/docs
http://localhost:8000/health
http://localhost:8000/metrics
```

Stop:

```bash
docker compose down
```

Remove the PostgreSQL volume as well:

```bash
docker compose down -v
```

## Testing

Run the backend tests locally:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

The CI pipeline runs tests before images are pushed. A test failure therefore blocks image promotion.

## Git and GitHub

The repository is managed with Git and the final project is intended to live in GitHub. Keep secrets out of Git history. `.gitignore` excludes environment files, virtual environments, dependency directories and Python cache files.

Example workflow:

```bash
git add .
git commit -m "Complete Session 21 DevOps capstone"
git push origin main
```

## CI/CD Pipeline

`.github/workflows/ci-cd.yml` implements:

1. Checkout
2. Backend dependency installation
3. Pytest
4. Frontend build
5. CodeQL SAST
6. Python and Node dependency scanning
7. Gitleaks secret scanning
8. Docker image build
9. Trivy HIGH/CRITICAL vulnerability gates
10. Push SHA-tagged images to GHCR
11. Helm deployment to Kubernetes on `main`

Images are tagged with `${{ github.sha }}` rather than `latest`, giving each deployment an immutable version.

### Required GitHub Secret

The deployment job expects:

```text
KUBE_CONFIG_DATA
```

Store the base64-encoded kubeconfig as a GitHub Actions secret. Never commit the kubeconfig or cloud credentials.

## DevSecOps

Security controls are intentionally layered:

| Control | Tool | Gate |
|---|---|---|
| SAST | CodeQL | Workflow job must pass |
| SCA | pip-audit + npm audit | Workflow job must pass |
| Secret scanning | Gitleaks | Workflow job must pass |
| Container scanning | Trivy | HIGH/CRITICAL findings fail the job |
| Dependency maintenance | Dependabot | Weekly update checks |

See `security/README.md` for details.

## Terraform Infrastructure

Terraform provisions:

- AWS VPC
- Two public subnets
- Two private subnets
- NAT gateway
- Amazon EKS cluster
- Managed worker node group

Commands:

```bash
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Create `terraform.tfvars` locally from `terraform.tfvars.example`. Do not commit credentials.

After use:

```bash
terraform destroy -var-file=terraform.tfvars
```

Destroying the environment is important because EKS/NAT resources can incur AWS charges.

## Kubernetes and Helm

The Helm chart contains:

- Frontend Deployment + Service
- Backend Deployment + Service
- PostgreSQL Deployment + Service
- ConfigMap
- Secrets
- PersistentVolumeClaim
- Ingress
- HPA
- Liveness probes
- Readiness probes
- Prometheus ServiceMonitor

Install/update:

```bash
helm upgrade --install helpdesk ./helm/helpdesk \
  -n helpdesk --create-namespace \
  --set backend.tag=<GIT_SHA> \
  --set frontend.tag=<GIT_SHA> \
  --wait
```

Verify:

```bash
kubectl get pods -n helpdesk
kubectl get svc -n helpdesk
kubectl get ingress -n helpdesk
kubectl get hpa -n helpdesk
helm list -n helpdesk
```

The backend and frontend run with two replicas by default. The backend HPA can scale from two to six replicas based on CPU utilization.

## Monitoring

The backend exposes Prometheus-formatted metrics at:

```text
/metrics
```

The Helm chart includes a `ServiceMonitor` for kube-prometheus-stack. `monitoring/prometheus-values.yaml` contains the monitoring configuration.

A complete demonstration should verify:

```bash
curl http://<backend-service>:8000/metrics
```

Then confirm the target is `UP` in Prometheus and display a populated HTTP request/latency/error panel in Grafana.

## GitOps

`gitops/application.yaml` defines an Argo CD Application pointing to the Helm chart in GitHub.

GitOps flow:

```text
Git commit
   ↓
GitHub
   ↓
Argo CD detects desired-state change
   ↓
Helm chart synchronized
   ↓
Kubernetes
   ↓
Self-healing / drift correction
```

The GitOps configuration is kept separate from application source so the desired deployment state remains version controlled.

## Troubleshooting Challenge

The `troubleshooting/` directory intentionally contains broken manifests:

- `broken-image.yaml` — invalid image reference
- `broken-service.yaml` — incorrect Service selector

For each issue, the expected process is:

1. Identify the symptom.
2. Inspect Kubernetes resources and logs/events.
3. Determine the root cause.
4. Apply the fix.
5. Verify the corrected state.
6. Document the evidence.

Useful commands:

```bash
kubectl get pods -n helpdesk
kubectl describe pod <pod> -n helpdesk
kubectl logs <pod> -n helpdesk
kubectl get svc -n helpdesk
kubectl get endpoints -n helpdesk
kubectl get events -n helpdesk --sort-by=.lastTimestamp
```

See `troubleshooting/README.md` for the expected investigation and resolution of both scenarios.

## Screenshots / Evidence

For the final submission, capture evidence for:

1. Application running in the browser
2. `pytest -v` passing
3. Docker Compose stack running
4. GitHub commit history
5. Successful GitHub Actions pipeline
6. GHCR images with SHA tags
7. Trivy scan output
8. Terraform plan
9. AWS VPC and EKS resources
10. Kubernetes pods/services/Helm release
11. Ingress-accessed application
12. `/metrics` output
13. Prometheus target marked `UP`
14. Grafana populated panel
15. Troubleshooting before/after state
16. GitOps/Argo CD synchronized application

## Lessons Learned

- A DevOps pipeline is a chain of quality gates rather than a single deployment command.
- Immutable image tags make deployments traceable to exact Git commits.
- Kubernetes probes distinguish a running process from an application that is actually ready to serve traffic.
- Terraform makes cloud infrastructure reproducible and reviewable.
- Helm packages Kubernetes configuration into a repeatable release.
- Monitoring and logs are essential for diagnosing production failures.
- GitOps moves deployment state into version-controlled desired state and enables drift correction.
- Troubleshooting is strongest when symptoms, evidence, root cause, fix and verification are documented separately.

## Final Verification Checklist

- [ ] Application works locally
- [ ] Backend tests pass
- [ ] Frontend builds
- [ ] Docker Compose works
- [ ] GitHub Actions passes
- [ ] CodeQL passes
- [ ] SCA passes
- [ ] Gitleaks passes
- [ ] Trivy passes security gate
- [ ] Images published to GHCR
- [ ] Terraform plan succeeds
- [ ] EKS is provisioned
- [ ] Helm release succeeds
- [ ] Pods are Running
- [ ] Ingress works
- [ ] HPA is available
- [ ] Prometheus scrapes the backend
- [ ] Grafana shows application metrics
- [ ] Argo CD syncs the Helm chart
- [ ] Troubleshooting scenarios are demonstrated
- [ ] Screenshots are added to the submission documentation
- [ ] Terraform resources are destroyed after the demo if no longer needed

---

## What the application does

HelpDesk lets a support team manage customer issues:

- Open a ticket (subject, description, category, priority, requester)
- Move it through `OPEN → IN_PROGRESS → RESOLVED`
- Filter by status, see KPI cards and an urgent-ticket counter
- Delete tickets

### REST API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/tickets` | List tickets (optional `?status_filter=open`) |
| GET | `/api/tickets/stats` | Counts per status + urgent |
| GET | `/api/tickets/{id}` | Get one ticket |
| POST | `/api/tickets` | Create a ticket |
| PUT | `/api/tickets/{id}` | Update status / assignee / etc. |
| DELETE | `/api/tickets/{id}` | Delete a ticket |
| GET | `/health`, `/ready`, `/metrics` | Liveness, readiness (DB check), Prometheus metrics |

Database table: `tickets`, created by Alembic migration `0001_create_tickets`.

### Run locally

```bash
docker compose up --build
# UI:       http://localhost:3000
# API docs: http://localhost:8000/docs
```

### Run tests

```bash
cd backend && pip install -r requirements.txt && pytest -v
```

Tests use a throwaway SQLite database (see `backend/tests/conftest.py`), never the real PostgreSQL.

### Notes

- Frontend container runs as non-root (`nginx-unprivileged`, port 8080); backend runs as UID 10001.
- Images are tagged with the Git commit SHA in CI.
- Before deploying, set the GHCR owner in `helm/helpdesk/values.yaml` (`ghcr.io/<your-github-username>/...`) and add the `KUBE_CONFIG_DATA` repository secret.

## Submission Evidence

Use [`evidence-checklist.md`](evidence-checklist.md) to collect the required real execution evidence before submission.
