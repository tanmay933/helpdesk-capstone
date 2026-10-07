# GitOps

Argo CD is used as the GitOps controller. The desired Kubernetes state is stored in Git under `helm/helpdesk/` and `gitops/application.yaml`.

Workflow:

1. A change is committed and pushed to GitHub.
2. Argo CD detects the desired-state change.
3. Argo CD synchronizes the Helm release into the `helpdesk` namespace.
4. Drift is corrected through automated self-healing.

The CI pipeline still performs build, test, scan, image publishing and an optional direct Helm deployment. Argo CD provides the GitOps operating model for environments where Git is the deployment source of truth.
