#!/usr/bin/env bash
set -euo pipefail
python -m pip install --quiet pip-audit
pip-audit -r backend/requirements.txt
npm --prefix frontend audit --audit-level=high
