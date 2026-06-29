#!/usr/bin/env bash
# ================================================================
#  GrabPic — EC2 Deployment Script
#  Usage:
#    First-time setup:   ./deploy.sh setup
#    Deploy / update:    ./deploy.sh deploy
#    Setup SSL:          ./deploy.sh ssl yourdomain.com
#    View logs:          ./deploy.sh logs
#    Stop all:           ./deploy.sh stop
# ================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/opt/grabpic"
COMPOSE_FILE="docker-compose.prod.yml"

log()   { echo -e "${GREEN}[✔]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1" >&2; exit 1; }
info()  { echo -e "${CYAN}[→]${NC} $1"; }

# ── Install Docker & Docker Compose on Ubuntu ──
install_docker() {
    if command -v docker &>/dev/null; then
        log "Docker already installed: $(docker --version)"
        return
    fi

    info "Installing Docker..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    sudo usermod -aG docker "$USER"
    log "Docker installed successfully"
}

# ── First-time server setup ──
cmd_setup() {
    info "Setting up EC2 instance for GrabPic..."

    install_docker

    # Create app directory
    sudo mkdir -p "$APP_DIR"
    sudo chown "$USER:$USER" "$APP_DIR"

    # Clone or copy project
    if [ -d "$APP_DIR/.git" ]; then
        info "Project already exists, pulling latest..."
        cd "$APP_DIR"
        git pull origin main
    else
        warn "Please clone your repo or copy your project to $APP_DIR"
        warn "  Example: git clone https://github.com/yourusername/grabpic.git $APP_DIR"
        warn "  Then run: ./deploy.sh deploy"
        return
    fi

    # Check for .env.production
    if [ ! -f "$APP_DIR/.env.production" ]; then
        if [ -f "$APP_DIR/.env.production.example" ]; then
            cp "$APP_DIR/.env.production.example" "$APP_DIR/.env.production"
            warn "Created .env.production from template."
            warn "EDIT IT NOW with your real secrets: nano $APP_DIR/.env.production"
        else
            error ".env.production.example not found!"
        fi
        return
    fi

    log "Setup complete! Run: ./deploy.sh deploy"
}

# ── Deploy / Update ──
cmd_deploy() {
    cd "$APP_DIR"

    # Validate env file
    if [ ! -f ".env.production" ]; then
        error ".env.production not found! Run './deploy.sh setup' first or create it from .env.production.example"
    fi

    # Check for placeholder values
    if grep -q "CHANGE_ME" ".env.production"; then
        error ".env.production still contains CHANGE_ME placeholders! Edit it first."
    fi

    info "Building and starting services..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
    docker compose -f "$COMPOSE_FILE" up -d

    info "Waiting for services to be healthy..."
    sleep 10

    # Health check
    if docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log "All services are running!"
        echo ""
        docker compose -f "$COMPOSE_FILE" ps
        echo ""
        log "GrabPic is live at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_SERVER_IP')"
    else
        error "Some services failed to start. Check logs: ./deploy.sh logs"
    fi
}

# ── Set up SSL with Let's Encrypt ──
cmd_ssl() {
    local domain="${1:-}"
    if [ -z "$domain" ]; then
        error "Usage: ./deploy.sh ssl yourdomain.com"
    fi

    cd "$APP_DIR"

    info "Setting up SSL for $domain..."

    # Install certbot
    if ! command -v certbot &>/dev/null; then
        sudo apt-get update -y
        sudo apt-get install -y certbot
    fi

    # Stop nginx temporarily
    docker compose -f "$COMPOSE_FILE" stop nginx

    # Get certificate (standalone mode)
    sudo certbot certonly --standalone \
        -d "$domain" \
        --non-interactive \
        --agree-tos \
        --email "admin@$domain" \
        --no-eff-email

    # Create certbot volume dirs
    mkdir -p certbot/conf certbot/www
    sudo cp -rL /etc/letsencrypt/* certbot/conf/

    # Update nginx.conf: replace YOUR_DOMAIN and uncomment SSL blocks
    sed -i "s/YOUR_DOMAIN/$domain/g" nginx/nginx.conf

    info "Enabling SSL in nginx.conf..."
    warn "You need to manually uncomment the HTTPS server block and HTTP→HTTPS redirect in nginx/nginx.conf"
    warn "Also uncomment the certbot volume mounts in $COMPOSE_FILE"

    # Restart everything
    docker compose -f "$COMPOSE_FILE" up -d

    log "SSL setup complete for $domain!"
    log "Don't forget to set up auto-renewal: sudo certbot renew --dry-run"
}

# ── Quick update (pull + restart, no rebuild) ──
cmd_update() {
    cd "$APP_DIR"
    info "Pulling latest changes..."
    git pull origin main
    info "Rebuilding and restarting..."
    docker compose -f "$COMPOSE_FILE" up -d --build
    log "Update complete!"
}

# ── View logs ──
cmd_logs() {
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100
}

# ── Stop all services ──
cmd_stop() {
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" down
    log "All services stopped."
}

# ── Status ──
cmd_status() {
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" ps
}

# ── Main ──
case "${1:-help}" in
    setup)   cmd_setup ;;
    deploy)  cmd_deploy ;;
    ssl)     cmd_ssl "${2:-}" ;;
    update)  cmd_update ;;
    logs)    cmd_logs ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    *)
        echo ""
        echo "  GrabPic Deployment Script"
        echo "  ─────────────────────────"
        echo "  Usage: ./deploy.sh <command>"
        echo ""
        echo "  Commands:"
        echo "    setup    Install Docker & prepare the server"
        echo "    deploy   Build and start all services"
        echo "    update   Pull latest code and restart"
        echo "    ssl      Set up HTTPS (usage: ./deploy.sh ssl yourdomain.com)"
        echo "    logs     View live logs"
        echo "    status   Show running services"
        echo "    stop     Stop all services"
        echo ""
        ;;
esac
