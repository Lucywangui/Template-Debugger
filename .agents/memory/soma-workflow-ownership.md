---
name: SOMA workflow ownership
description: Port ownership constraints for the SOMA preview service
---

The registered `artifacts/soma-app: web` workflow is the canonical SOMA preview service and must be the only workflow binding port 22202.

**Why:** A second legacy preview workflow using the same port makes the artifact workflow fail at startup with a misleading app-crash appearance.

**How to apply:** Before restarting SOMA, check for duplicate preview workflows, stop any legacy service using port 22202, then restart the artifact-owned workflow.