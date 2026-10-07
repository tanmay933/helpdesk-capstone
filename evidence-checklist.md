# Session 21 Evidence Checklist

Capture real screenshots/links after running the project. Do not fabricate evidence.

## Application and tests
- [ ] `pytest -v` passes in `backend/` (show all tests).
- [ ] Docker Compose starts successfully and the HelpDesk UI loads at `:3000`.
- [ ] HelpDesk API endpoints work through the frontend/API path.

## GitHub / CI/CD
- [ ] Public GitHub repository URL.
- [ ] At least 10 meaningful commits.
- [ ] Green GitHub Actions run URL.
- [ ] GHCR backend image tagged with commit SHA.
- [ ] GHCR frontend image tagged with commit SHA.
- [ ] Trivy HIGH/CRITICAL scan result captured.
- [ ] Be able to explain at least one Trivy finding and its mitigation.

## Terraform / AWS
- [ ] `terraform fmt -check` passes.
- [ ] `terraform validate` passes.
- [ ] `terraform plan` captured.
- [ ] AWS VPC/EKS/node group visible in the AWS console.
- [ ] `terraform destroy` output captured after the demo.

## Kubernetes / Helm
- [ ] `helm lint ./helm/helpdesk` passes.
- [ ] `helm template` rendered successfully with the intended values.
- [ ] `kubectl get pods` captured.
- [ ] `kubectl get svc` captured.
- [ ] `helm list` captured.
- [ ] Ingress/application access captured.
- [ ] HPA status captured if enabled.

## Monitoring / GitOps
- [ ] `/metrics` endpoint captured.
- [ ] Prometheus target for HelpDesk is `UP`.
- [ ] Grafana dashboard has a populated HelpDesk/application metric panel.
- [ ] Argo CD application is synced/healthy if GitOps deployment is demonstrated.

## Final hygiene
- [ ] No `.env`, AWS keys, kubeconfig, Terraform state, `node_modules`, `__pycache__`, or `.pytest_cache` committed.
- [ ] README matches the HelpDesk domain and actual commands/results.
