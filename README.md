# Deploy a React App with Full CI/CD Pipeline on AWS

Automated CI/CD pipeline using **AWS CodePipeline**, **AWS CodeBuild**, and **Amazon S3** to build and deploy a React application on every GitHub push — no manual deployment steps required.

**Live demo:** http://react-app-dora-2026.s3-website.eu-west-2.amazonaws.com

---

## Architecture

```
GitHub (push to main)
        │
        ▼
AWS CodePipeline
  ├─ Stage 1: Source
  │   └─ GitHub (via GitHub App) — detects push, pulls source code
  │
  ├─ Stage 2: Build
  │   └─ AWS CodeBuild
  │       ├─ reads buildspec.yml from repo root
  │       ├─ npm ci --legacy-peer-deps
  │       ├─ npm run build
  │       └─ outputs build/ as pipeline artifact
  │
  └─ Stage 3: Deploy
      └─ Amazon S3
          ├─ extracts build artifact
          └─ serves as public static website
```

---

## How it works

Every push to the `main` branch triggers the pipeline automatically:

1. **CodePipeline** detects the GitHub push via webhook
2. **CodeBuild** pulls the source, installs dependencies, and runs the production build
3. The `build/` output is deployed directly to the **S3 bucket**
4. S3 serves the updated React app as a public static website — no server required

---

## Repository structure

```
aws-codepipeline-react-s3/
├── buildspec.yml       ← CodeBuild instructions (must be at repo root)
├── public/             ← React public assets
├── src/
│   ├── App.js          ← Main React component
│   └── index.js        ← React entry point
├── package.json
├── package-lock.json
└── README.md
```

---

## buildspec.yml

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - echo Installing dependencies...
      - npm ci --legacy-peer-deps

  build:
    commands:
      - echo Building the React application...
      - npm run build

  post_build:
    commands:
      - echo Build complete.

artifacts:
  base-directory: build
  files:
    - '**/*'
  discard-paths: no

cache:
  paths:
    - node_modules/**/*
```

**Key points:**
- `buildspec.yml` must be in the **root of the repository** — CodeBuild looks for it there by default
- `base-directory: build` tells CodePipeline to deploy only the React build output, not the source code
- `npm ci --legacy-peer-deps` ensures a clean, reproducible install matching `package-lock.json`
- `cache: node_modules` speeds up repeat builds by caching dependencies between pipeline runs

---

## AWS setup

### 1. S3 bucket

Create a bucket and configure it for static website hosting:

- Enable **static website hosting** — index document: `index.html`, error document: `index.html`
- **Disable** Block Public Access
- Apply this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

### 2. CodePipeline

Create a new pipeline with these three stages:

| Stage | Provider | Configuration |
|---|---|---|
| Source | GitHub (Version 2) | Connect via GitHub App · this repo · branch: main |
| Build | AWS CodeBuild | New project · managed image · use buildspec.yml |
| Deploy | Amazon S3 | Select your bucket · ✅ Extract file before deploy |

### 3. Trigger a deployment

Push any change to `main`. The pipeline detects it and runs automatically:

```bash
git add .
git commit -m "update: change app content"
git push
```

Watch Source → Build → Deploy all turn green in the CodePipeline console. The updated app is live within 2-3 minutes.

---

## Updating the app

To change what the app displays, edit `src/App.js`, then push:

```bash
git add src/App.js
git commit -m "update: new message"
git push
```

The pipeline triggers automatically — no manual AWS console interaction needed.

---

## How this differs from GitHub Actions CI/CD

| | This project | GitHub Actions approach |
|---|---|---|
| Pipeline location | Inside AWS (CodePipeline console) | Inside GitHub (`.github/workflows/`) |
| Trigger mechanism | GitHub webhook → CodePipeline | GitHub push event → Actions runner |
| Build environment | AWS CodeBuild managed container | GitHub-hosted runner |
| AWS authentication | CodePipeline IAM service role | IAM OIDC (no stored credentials) |
| Build config file | `buildspec.yml` | `*.yml` in `.github/workflows/` |
| Visibility | AWS Console | GitHub Actions tab |

Both are valid production patterns. CodePipeline keeps the entire delivery chain inside AWS — useful when an organisation uses AWS tooling exclusively and wants a single control plane for pipelines, approvals, and deployment history.

---

## Related projects

- [Cloud-Native Static Platform on AWS](https://doraejangue.com/projects/cloud-platform) — private S3 + CloudFront + OAC + Terraform
- [Dual-Track CI/CD Pipeline](https://doraejangue.com/projects/cicd-pipeline) — GitHub Actions deploying to both S3 and Kubernetes

---

## Author

**Huguette Dora Edjangue** — Platform & DevOps Engineer · London / Remote

[doraejangue.com](https://doraejangue.com) · [LinkedIn](https://linkedin.com/in/hugdora) · [GitHub](https://github.com/hugdora)

