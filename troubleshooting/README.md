# Final Troubleshooting Challenge

The project includes intentionally broken manifests so the troubleshooting process can be demonstrated safely.

## Scenario 1 — Broken Image

File: `broken-image.yaml`

**Symptom:** the pod enters `ImagePullBackOff`/`ErrImagePull`.

**Investigation:**
```bash
kubectl get pods -n helpdesk
kubectl describe pod <pod-name> -n helpdesk
```

**Root cause:** the image reference points to an invalid/non-existent image tag.

**Fix:** update the image to the correct GHCR image and immutable commit-SHA tag.

**Verification:**
```bash
kubectl get pods -n helpdesk
kubectl rollout status deployment/helpdesk-backend -n helpdesk
```

## Scenario 2 — Broken Service

File: `broken-service.yaml`

**Symptom:** the Service has no usable endpoints and traffic fails.

**Investigation:**
```bash
kubectl get svc -n helpdesk
kubectl get endpoints -n helpdesk
kubectl get pods --show-labels -n helpdesk
```

**Root cause:** the Service selector does not match the backend pod labels.

**Fix:** make the selector match `app: helpdesk-backend`.

**Verification:** confirm endpoints are populated and call the backend health endpoint through the Service.
