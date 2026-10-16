# HelpDesk — DevOps Final Capstone

HelpDesk is a full-stack support-ticket application built to demonstrate an end-to-end DevOps lifecycle: application development, testing, containerization, CI/CD, image security scanning, infrastructure as code, Kubernetes deployment, and observability.

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql)
![Container](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker)
![Orchestration](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?style=flat-square&logo=kubernetes)
![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC?style=flat-square&logo=terraform)
![Status](https://img.shields.io/badge/status-complete-brightgreen?style=flat-square)

> A full-stack support-ticket application demonstrating an end-to-end DevOps lifecycle.

**Repository:** [tanmay933/helpdesk-capstone](https://github.com/tanmay933/helpdesk-capstone)

## Demo Video

**Presenter:** Tanmay Mittal  
**Roll Number:** 24BCS10491

[▶ Watch / Download the HelpDesk Capstone Demo](HelpDesk-Demo.mp4)

This demo showcases the HelpDesk application and its DevOps deployment workflow.

## Project Presentation

**Author:** Tanmay Mittal  
**Roll Number:** 24BCS10491

[Download the HelpDesk DevOps Capstone Presentation](HelpDesk-DevOps-Capstone-Presentation.pptx)

> **Infrastructure status:** The AWS VPC and EKS resources created for this project were destroyed after verification to avoid ongoing cloud costs. AWS screenshots below are historical evidence from when those resources existed; they do not mean the resources are currently running.

## Contents

- [Application overview](#application-overview)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Application and API](#application-and-api)
- [Local setup](#local-setup)
- [Testing](#testing)
- [CI/CD and container registry](#cicd-and-container-registry)
- [DevSecOps](#devsecops)
- [Terraform and AWS](#terraform-and-aws)
- [Kubernetes and Helm](#kubernetes-and-helm)
- [Monitoring and observability](#monitoring-and-observability)
- [Screenshots and evidence](#screenshots-and-evidence)
- [Demo video](#demo-video)
- [Key learnings](#key-learnings)

## Application overview

HelpDesk lets a support team create and manage customer tickets. Users can view tickets, track their status and priority, and perform ticket operations through the web interface and REST API.

The project connects the application to the delivery and operations practices used in real deployments. The goal is not only to run the app, but also to test it, package it consistently, scan its images, version the deployment artifacts, and monitor the running services.

## Architecture

```text
Developer
   |
   v
Git + GitHub
   |
   v
GitHub Actions
   |-- Backend tests + frontend build
   |-- Security checks
   |-- Docker image build
   |-- Trivy container scan
   `-- Publish SHA-tagged images to GHCR
                    |
                    v
             Kubernetes + Helm
              |             |
              v             v
           Frontend       FastAPI
                              |
                              v
                          PostgreSQL

Terraform -> AWS VPC + EKS infrastructure
Prometheus -> collects metrics -> Grafana dashboards
GitOps configuration is maintained in the repository.
```

The pipeline and runtime solve different problems: CI checks and packages code, while Kubernetes runs the application and maintains the desired state declared in its manifests or Helm chart. Prometheus and Grafana provide visibility into runtime behavior.

## Technology stack

| Area | Tools |
|---|---|
| Frontend | React, Vite, Nginx |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM and migrations | SQLAlchemy, Alembic |
| Automated tests | Pytest |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Container registry | GitHub Container Registry (GHCR) |
| Image scanning | Trivy |
| Infrastructure as Code | Terraform, AWS VPC, Amazon EKS |
| Orchestration and packaging | Kubernetes, Helm, Ingress |
| Monitoring | Prometheus, Grafana |
| GitOps configuration | Argo CD application definition |

## Application and API

The backend exposes endpoints for ticket operations and operational checks.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/tickets` | List tickets |
| `GET` | `/api/tickets/stats` | Return ticket statistics |
| `GET` | `/api/tickets/{id}` | Retrieve one ticket |
| `POST` | `/api/tickets` | Create a ticket |
| `PUT` | `/api/tickets/{id}` | Update a ticket |
| `DELETE` | `/api/tickets/{id}` | Delete a ticket |
| `GET` | `/health` | Health check |
| `GET` | `/ready` | Readiness check, including database readiness |
| `GET` | `/metrics` | Prometheus-format metrics |

FastAPI provides interactive API documentation through Swagger UI. PostgreSQL stores application data; SQLAlchemy provides database access and Alembic manages schema migrations.

When the local Docker Compose stack is running, the main endpoints are:

- Application: `http://localhost:3000`
- API documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Metrics: `http://localhost:8000/metrics`

## Local setup

Requirements: Docker Desktop (or Docker Engine) with Docker Compose.

```bash
docker compose up --build
```

Open `http://localhost:3000` in a browser. Stop the containers with:

```bash
docker compose down
```

This command does not delete the named database volume. Avoid `docker compose down -v` unless you intentionally want to remove the local database volume and its data.

## Testing

The recorded backend test run completed with **9 passed**. From the repository root, the verified command was:

```bash
PYTHONPATH=backend pytest -v
```

Setting `PYTHONPATH=backend` allows Python to import the backend application package with this repository layout. The tests cover health/readiness and ticket API behavior, along with metrics-related behavior. The saved terminal screenshot is included in the evidence section below.

## CI/CD and container registry

The GitHub Actions workflow automates validation and image delivery. The implemented pipeline includes testing, a frontend build, Docker image builds, configured security scans, and publishing images to GHCR.

Images are tagged with the Git commit SHA. A commit-SHA tag links a published image to the source revision used to build it, improving traceability compared with relying only on a mutable tag such as `latest`.

The recorded successful workflow and GHCR package screenshots are included below.

[View GitHub Actions](https://github.com/tanmay933/helpdesk-capstone/actions)

## DevSecOps

Trivy scans the backend and frontend container images for configured HIGH and CRITICAL vulnerabilities. The workflow uses `exit-code: 1` so matching findings under the scan policy can fail the job; `ignore-unfixed` excludes vulnerabilities without an available fix.

A successful scan means no findings triggered the configured policy at that point in time. It does not prove that an image is completely free of vulnerabilities.

## Terraform and AWS

Terraform defines the cloud infrastructure as code, including the VPC, subnets, NAT gateway, EKS cluster, and managed node group. Infrastructure as Code makes resource definitions reviewable and repeatable.

The lifecycle used for this exercise was:

```bash
terraform init
terraform plan
terraform apply
# Verify the resources
terraform destroy
```

**Cost-control note:** the AWS resources were destroyed after verification. The VPC, EKS, node-group, subnet, and NAT screenshots in this README are evidence captured before destruction, not a live AWS deployment.

## Kubernetes and Helm

Kubernetes provides declarative resources for running and connecting the application components. Deployments describe the desired replica count and update strategy; Services provide stable network endpoints; Ingress can route external HTTP traffic; and probes help Kubernetes distinguish a running container from an application that is ready to serve requests.

Helm packages related Kubernetes resources into a release, making configuration and upgrades easier to repeat. The repository contains a HelpDesk Helm chart and Kubernetes configuration.

The screenshots are point-in-time evidence. They should not be interpreted as a claim that every pod or cluster is currently healthy or running.

## Monitoring and observability

Prometheus scrapes metrics exposed by the application and configured targets. A target marked **UP** indicates that Prometheus could scrape it at the time shown. Grafana presents metrics as dashboards, helping an operator inspect resource usage and application behavior.

The screenshots include Prometheus target status, Kubernetes metrics, HelpDesk metrics, and Grafana dashboards. Metrics and dashboard screenshots demonstrate observability configuration; they are not a guarantee of current runtime health.

## Screenshots and evidence

All image paths below are **relative to this root `README.md`** and point into the repository's existing `screenshots/` folder. Keep that folder name unchanged. The timestamp-based filenames are intentionally written using angle-bracket Markdown links because their names contain spaces.

### 1. Application and API

**TaskBoard / HelpDesk UI**

![HelpDesk application UI](screenshots/taskboard-browser.png)

**Swagger API documentation**

![Swagger API documentation](screenshots/swagger-api.png)

**Health endpoint**

![Health endpoint response](screenshots/health-endpoint.png)

**Ticket API response**

![Ticket API response](screenshots/api-ticket-response.png)

### 2. Automated testing and CI/CD

**Pytest — 9 tests passed**

![Pytest results](screenshots/pytest-passing.png)

**GitHub Actions pipeline**

![Successful GitHub Actions pipeline](screenshots/github-actions-pipeline-success.png)

**Git push / source-control evidence**

![Git push evidence](screenshots/git-push-success.png)

### 3. GHCR and container security

**Backend image in GHCR**

![Backend image in GHCR](screenshots/ghcr-backend.png)

**Frontend image in GHCR**

![Frontend image in GHCR](screenshots/ghcr-frontend.png)

**Trivy scan evidence**

![Trivy scan evidence](screenshots/trivy-scan-results.png)

### Security scan workflow steps

![Security scan workflow steps](screenshots/trivy-scan-workflow-steps.png)

## 4. Kubernetes and Helm

Kubernetes manages the desired state of application workloads. Deployments define the number of replicas and how updates are performed, while Services provide stable network access to application components.

Helm packages Kubernetes manifests into a release, making deployments and configuration changes easier to repeat.

### Kubernetes resources

![Kubernetes resources](screenshots/kubernetes-resources.png)

### Helm release

![Helm release](screenshots/helm-release.png)

**Prometheus view of HelpDesk pods**

![Prometheus HelpDesk pod metrics](screenshots/prometheus-helpdesk-pods.png)

### 5. Prometheus and Grafana

**Prometheus targets**

![Prometheus targets](screenshots/prometheus-target-health.png)

**HelpDesk application metrics**

![Prometheus HelpDesk application metrics](screenshots/prometheus-helpdesk-application-metrics.png)

**Kubernetes metrics in Prometheus**

![Prometheus Kubernetes metrics](screenshots/prometheus-kubernetes-metrics.png)

**Grafana cluster resource monitoring**

![Grafana cluster resource monitoring](screenshots/grafana-cluster-resource-monitoring.png)

**Grafana HelpDesk pod resources**

![Grafana HelpDesk pod resources](screenshots/grafana-helpdesk-pod-resources.png)

### 6. Terraform and AWS evidence

These screenshots were captured while the AWS resources existed. The resources have since been destroyed.

### EKS cluster
![AWS EKS cluster](screenshots/aws-eks-cluster.png)

### EKS node group
![AWS EKS node group](screenshots/aws-eks-node-group.png)

### Subnets
![AWS subnets](screenshots/aws-subnets.png)

### NAT gateway
![AWS NAT gateway](screenshots/aws-nat-gateway.png)

### VPC
![AWS VPC](screenshots/aws-vpc.png)

### Health, readiness and metrics
![Health and metrics output](screenshots/health-endpoint.png)

### Additional application UI
![Application UI detail](screenshots/taskboard-ui-detail.png)

**Additional Prometheus metrics output**

![Additional Prometheus metrics](screenshots/prometheus-kubernetes-metrics.png)

**Trivy results in GitHub**

![Trivy results in GitHub](screenshots/trivy-scan-results.png)

## Demo video

**Recording:** _Add the video link here after uploading the walkthrough._

A concise walkthrough can show the application and API, the recorded passing test run, the successful GitHub Actions workflow, GHCR image tags, Trivy scan configuration/results, Kubernetes and Helm evidence, Prometheus/Grafana, and the historical Terraform/AWS evidence. Explain that the AWS resources were destroyed after verification.

## Key learnings

- Automated tests provide a repeatable quality check before delivery.
- Docker packages application components into reproducible images.
- Commit-SHA tags improve traceability between source code and container artifacts.
- Trivy adds a configurable container-vulnerability gate to CI.
- Kubernetes and Helm provide declarative, repeatable deployment mechanisms.
- Readiness probes are important because a running process is not necessarily ready to serve requests.
- Prometheus and Grafana help make application and infrastructure behavior visible.
- Terraform makes cloud infrastructure reproducible, while destroying unused resources helps control costs.

---


