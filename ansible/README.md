# Ansible Infrastructure & Deployment Automation

This directory contains Ansible automation playbooks and inventory configurations for provisioning remote Linux production nodes and orchestrating zero-downtime service deployments.

---

## 1. Directory Structure

```
ansible/
├── inventory/
│   └── hosts.ini            # Server target definitions (grouped by role)
├── playbooks/
│   ├── setup-server.yml     # Provisions Docker, dependencies, security & folders
│   └── deploy.yml           # Deploys compose stack & verifies health endpoints
└── README.md                # Execution manual
```

---

## 2. Prerequisites

* Ansible `>= 2.14` installed on deployment controller.
* SSH key-based access to the target machines.
* Python 3 available on the target machines.

---

## 3. Playbook Descriptions

### `setup-server.yml`
Prepares a clean Ubuntu host for running the containerized NovaStore platform:
1. Updates package repositories.
2. Installs security dependencies, `ufw` firewall, and tools.
3. Installs Docker CE and Docker Compose plugin.
4. Grants Docker permissions to the deployment user.
5. Configures basic UFW firewall rules (22, 80, 443, 5000, 9090).
6. Creates standard deployment directory `/opt/novastore`.

### `deploy.yml`
Performs continuous deployment on target webservers:
1. Copies `docker-compose.yml` to the remote `/opt/novastore` directory.
2. Synchronizes secure environment variables.
3. Pulls latest container images from registry.
4. Restarts containers with `--remove-orphans`.
5. Polls `/api/health` and `/api/health/ready` to verify service availability before completing.

---

## 4. Execution Commands

### Syntax Verification
Check playbook syntax without touching servers:
```bash
ansible-playbook -i inventory/hosts.ini playbooks/setup-server.yml --syntax-check
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml --syntax-check
```

### Dry Run (Check Mode)
```bash
ansible-playbook -i inventory/hosts.ini playbooks/setup-server.yml --check
```

### Provision Host Servers
```bash
ansible-playbook -i inventory/hosts.ini playbooks/setup-server.yml
```

### Deploy / Update Application Stack
```bash
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml
```

---

## 5. Security Notes

* Never commit production passwords or private SSH keys into Git.
* In real-world environments, use `ansible-vault` to encrypt sensitive variables (`ansible-vault encrypt_string`).
