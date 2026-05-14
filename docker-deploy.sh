#!/bin/bash

# ClassSync Local Docker Deployment Script
# This script deploys ClassSync using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_colored() {
    echo -e "${1}${2}${NC}"
}

echo_error() {
    echo_colored $RED "[ERROR] $1"
}

echo_success() {
    echo_colored $GREEN "[SUCCESS] $1"
}

echo_warn() {
    echo_colored $YELLOW "[WARNING] $1"
}

echo_info() {
    echo -e "[INFO] $1"
}

# Default values
COMPOSE_FILE="docker-compose.prod.yml"
ACTION="up"
BUILD_IMAGES=false
DETACH=true
FORCE_RECREATE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        --build)
            BUILD_IMAGES=true
            shift
            ;;
        --up)
            ACTION="up"
            shift
            ;;
        --down)
            ACTION="down"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        -a|--attach)
            DETACH=false
            shift
            ;;
        --force-recreate)
            FORCE_RECREATE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS] [COMMAND]"
            echo "Deploy ClassSync using Docker Compose"
            echo ""
            echo "Options:"
            echo "  -f, --file FILE           Docker Compose file (default: docker-compose.prod.yml)"
            echo "  --build                   Build images before starting"
            echo "  --force-recreate          Force recreate containers"
            echo "  -a, --attach              Attach to container logs (don't run detached)"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Commands:"
            echo "  --up                     Start services (default)"
            echo "  --down                   Stop and remove services"
            echo "  --restart                Restart services"
            exit 0
            ;;
        *)
            echo_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check prerequisites
check_prerequisites() {
    echo_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo_error "docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        # Check if docker compose (v2) is available as a plugin
        if ! docker compose version &> /dev/null; then
            echo_error "docker-compose is not installed"
            exit 1
        fi
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo_error "Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        echo_error "Docker daemon is not running"
        exit 1
    fi
    
    echo_success "Prerequisites check passed"
}

# Build images if requested
build_images() {
    if [ "$BUILD_IMAGES" = true ]; then
        echo_info "Building Docker images..."
        docker-compose -f $COMPOSE_FILE build
        echo_success "Images built successfully"
    fi
}

# Start services
start_services() {
    echo_info "Starting ClassSync services..."
    
    CMD="docker-compose -f $COMPOSE_FILE"
    
    if [ "$FORCE_RECREATE" = true ]; then
        CMD="$CMD up --force-recreate"
    else
        CMD="$CMD up"
    fi
    
    if [ "$BUILD_IMAGES" = true ]; then
        CMD="$CMD --build"
    fi
    
    if [ "$DETACH" = true ]; then
        CMD="$CMD -d"
    fi
    
    echo_info "Executing: $CMD"
    eval $CMD
    
    echo_success "ClassSync services started successfully"
}

# Stop services
stop_services() {
    echo_info "Stopping ClassSync services..."
    docker-compose -f $COMPOSE_FILE down
    echo_success "ClassSync services stopped"
}

# Restart services
restart_services() {
    echo_info "Restarting ClassSync services..."
    docker-compose -f $COMPOSE_FILE restart
    echo_success "ClassSync services restarted"
}

# Wait for services to be healthy
wait_for_services() {
    echo_info "Waiting for services to be ready..."
    
    # Wait for API to be ready
    echo_info "Waiting for API service to be ready..."
    timeout 300 bash -c 'until curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; do sleep 5; done' || {
        echo_error "API service did not become ready in time"
        exit 1
    }
    
    echo_success "All services are ready"
}

# Display deployment status
display_status() {
    echo ""
    echo_info "ClassSync Deployment Status:"
    echo "=============================="
    echo_info "Services:"
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    echo_info "Access Information:"
    echo_info "- API: http://localhost:8000"
    echo_info "- API Docs: http://localhost:8000/docs"
    echo_info "- Health Check: http://localhost:8000/api/v1/health"
    echo_info "- Metrics: http://localhost:9090 (if enabled)"
    echo_info "- Flower Dashboard: http://localhost:5555 (username: admin, password: flowerpassword)"
    echo_info "- PostgreSQL: localhost:5432 (username: postgres, password: password)"
    echo_info "- Redis: localhost:6379"
    echo ""
    echo_success "ClassSync is now running locally!"
}

# Main execution
main() {
    echo_info "Starting ClassSync local Docker deployment..."
    
    check_prerequisites
    build_images
    
    case $ACTION in
        "up")
            start_services
            wait_for_services
            display_status
            ;;
        "down")
            stop_services
            ;;
        "restart")
            restart_services
            wait_for_services
            display_status
            ;;
        *)
            echo_error "Unknown action: $ACTION"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"