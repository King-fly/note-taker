#!/bin/bash

# ClassSync Production Deployment Script
# This script automates the deployment of ClassSync to a Kubernetes cluster

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
NAMESPACE="classsync"
HELM_RELEASE="classsync"
TIMEOUT="10m"
DRY_RUN=false
UPGRADE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--release)
            HELM_RELEASE="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --upgrade)
            UPGRADE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Deploy ClassSync to Kubernetes"
            echo ""
            echo "Options:"
            echo "  -n, --namespace STRING    Kubernetes namespace (default: classsync)"
            echo "  -r, --release STRING      Helm release name (default: classsync)"
            echo "  -t, --timeout DURATION    Timeout duration (default: 10m)"
            echo "  --dry-run                 Dry run mode (don't actually deploy)"
            echo "  --upgrade                 Upgrade existing deployment"
            echo "  -h, --help               Show this help message"
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
    
    if ! command -v kubectl &> /dev/null; then
        echo_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        echo_error "helm is not installed"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        echo_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    echo_success "Prerequisites check passed"
}

# Build and push Docker images
build_images() {
    echo_info "Building Docker images..."
    
    if [ "$DRY_RUN" = true ]; then
        echo_warn "Dry run: Skipping image build"
        return 0
    fi
    
    # Build the main API image
    if [ -f "Dockerfile" ]; then
        echo_info "Building API image..."
        docker build -t classsync/api:latest .
        echo_success "API image built successfully"
    else
        echo_error "Dockerfile not found in current directory"
        exit 1
    fi
}

# Deploy using Helm
deploy_helm() {
    echo_info "Deploying ClassSync using Helm..."
    
    if [ "$DRY_RUN" = true ]; then
        echo_warn "Dry run: Running helm install --dry-run"
        helm install $HELM_RELEASE ./helm/classsync \
            --namespace $NAMESPACE \
            --create-namespace \
            --dry-run
        return 0
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    if [ "$UPGRADE" = true ]; then
        echo_info "Upgrading existing deployment..."
        helm upgrade $HELM_RELEASE ./helm/classsync \
            --namespace $NAMESPACE \
            --timeout $TIMEOUT \
            --wait
    else
        echo_info "Installing new deployment..."
        # Check if release already exists
        if helm status $HELM_RELEASE --namespace $NAMESPACE &> /dev/null; then
            echo_error "Release $HELM_RELEASE already exists in namespace $NAMESPACE"
            echo_info "Use --upgrade flag to upgrade existing release"
            exit 1
        fi
        
        helm install $HELM_RELEASE ./helm/classsync \
            --namespace $NAMESPACE \
            --create-namespace \
            --timeout $TIMEOUT \
            --wait
    fi
    
    echo_success "Helm deployment completed"
}

# Wait for deployments to be ready
wait_for_deployments() {
    if [ "$DRY_RUN" = true ]; then
        echo_warn "Dry run: Skipping deployment readiness check"
        return 0
    fi
    
    echo_info "Waiting for deployments to be ready..."
    
    # Wait for all deployments in the namespace
    kubectl wait --for=condition=Ready pods -l app=classsync-api --timeout=$TIMEOUT -n $NAMESPACE
    kubectl wait --for=condition=Ready pods -l app=classsync-worker --timeout=$TIMEOUT -n $NAMESPACE
    kubectl wait --for=condition=Ready pods -l app=postgres --timeout=$TIMEOUT -n $NAMESPACE
    kubectl wait --for=condition=Ready pods -l app=redis --timeout=$TIMEOUT -n $NAMESPACE
    
    echo_success "All deployments are ready"
}

# Display deployment status
display_status() {
    if [ "$DRY_RUN" = true ]; then
        echo_warn "Dry run: Skipping status display"
        return 0
    fi
    
    echo_info "Deployment status:"
    echo ""
    kubectl get pods -n $NAMESPACE
    echo ""
    kubectl get services -n $NAMESPACE
    echo ""
    kubectl get ingress -n $NAMESPACE
    echo ""
    
    # Get external IP
    EXTERNAL_IP=$(kubectl get ingress ${HELM_RELEASE} -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    echo_info "External IP: $EXTERNAL_IP"
    echo_info "Application should be accessible at: http://$EXTERNAL_IP"
}

# Main execution
main() {
    echo_info "Starting ClassSync deployment..."
    
    check_prerequisites
    
    if [ "$DRY_RUN" = false ]; then
        build_images
    fi
    
    deploy_helm
    wait_for_deployments
    display_status
    
    echo ""
    echo_success "ClassSync deployment completed successfully!"
    echo_info "Next steps:"
    echo_info "1. Verify the application is working at the exposed endpoint"
    echo_info "2. Check the logs: kubectl logs -f -l app=classsync-api -n $NAMESPACE"
    echo_info "3. Monitor the deployment: kubectl get pods -n $NAMESPACE"
}

# Execute main function
main "$@"