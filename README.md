# IT Infrastructure Observability Stack (Prometheus & Grafana)

This repository contains a containerized, self-provisioning infrastructure observability and alerting system. It is designed to run locally using Docker Compose, collecting and visualizing system-level performance metrics and alerting when thresholds are breached.

For an IT Support or Infrastructure Engineer, this project demonstrates key modern skills: **Infrastructure as Code (IaC)**, **observability setup**, **alerts-as-code management**, and **automated dashboard provisioning**.

---

## Architecture

```mermaid
graph TD
    A[Host / Container system] -->|Exposes raw metrics| B[Node Exporter :9100]
    B -->|Prometheus Scrapes| C[Prometheus Server :9090]
    C -->|Queries Metrics| D[Grafana Dashboard :3000]
    C -->|Triggers Alert Rules| E[Alertmanager :9093]
    E -->|Notification Routes| F[Webhooks / Slack / Email]
```

1. **Node Exporter**: An agent that harvests system hardware metrics (CPU, Memory, Disk usage, Network stats) from the host OS.
2. **Prometheus**: A time-series database configured to scrape metrics from Node Exporter every 5 seconds. It evaluates alert rules against incoming data.
3. **Alertmanager**: Receives active alert events from Prometheus, groups them, and coordinates notifications (configured with a webhook placeholder).
4. **Grafana**: A visualization dashboard automatically provisioned to connect to Prometheus and pre-load an infrastructure dashboard.

---

## Port Mappings

Once running, you can access the various services on your local machine:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Grafana** | `http://localhost:3000` | Beautiful visualization dashboard. (Credentials: `admin`/`admin`) |
| **Prometheus** | `http://localhost:9090` | Raw query interface and alert rules viewer. |
| **Alertmanager** | `http://localhost:9093` | Alert aggregation and routing control pane. |
| **Node Exporter** | `http://localhost:9100/metrics` | The raw text metrics gathered from the environment. |

---

## Quick Start Guide

### 1. Prerequisites
Ensure you have **Docker Desktop** installed and running on your machine.

### 2. Launch the Stack
From this directory, open a terminal (PowerShell or command prompt) and run:
```powershell
docker compose up -d
```
Docker will download the lightweight images and spin up the containers in the background.

### 3. Verify Targets
* Open `http://localhost:9090/targets` in your browser.
* Ensure both the `prometheus` and `node-exporter` endpoints show their status as **"UP"**.

### 4. Access the Pre-loaded Dashboard
* Go to `http://localhost:3000` and sign in with username `admin` and password `admin`.
* Skip the password change prompt (or update it).
* Navigate to **Dashboards** (left sidebar) to find the **"Server Infrastructure Performance"** dashboard.
* You should see live, auto-updating metrics for CPU, Memory, Disk space, and Network interfaces.

---

## Alert Rules Defined

Under [prometheus/alert_rules.yml](./prometheus/alert_rules.yml), the following alerting thresholds are configured:

1. **InstanceDown**: Fires if Node Exporter becomes unreachable for > 10 seconds. (Critical)
2. **HighCpuUsage**: Fires if system CPU usage exceeds 70% for > 10 seconds. (Warning)
3. **HighMemoryUsage**: Fires if memory consumption exceeds 80% for > 10 seconds. (Warning)
4. **DiskSpaceWarning**: Fires if disk storage usage exceeds 80% for > 10 seconds. (Warning)

---

## Interactive Demo: Simulating Load & Alerting

To prove the alert system works and demonstrate it to leadership or team members, use the included load simulation script:

1. Open PowerShell and navigate to this folder.
2. Run the simulator script:
   ```powershell
   ./simulate_load.ps1
   ```
3. Select **Option 1 (Container-based CPU Stress)**. This will spin up two infinite loops inside Docker.
4. Watch the Grafana dashboard: CPU utilization will spike.
5. Watch the Prometheus alert viewer (`http://localhost:9090/alerts`):
   * Within 5-10 seconds, the `HighCpuUsage` rule will transition to **PENDING**.
   * After 10 more seconds, the state changes to **FIRING** (turns red).
6. Open Alertmanager (`http://localhost:9093`) to see the alert captured, grouped, and routed.
7. Back in the PowerShell script, select **Option 3 (Stop all CPU Stress tasks)** to shut down the stress containers.
8. Watch Grafana and Prometheus return to their green/healthy states.
