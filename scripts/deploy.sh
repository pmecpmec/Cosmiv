#!/bin/bash
# Production Deployment Script for Cosmiv
# Usage: ./scripts/deploy.sh [platform]
# Platforms: railway, render, flyio, ssh, kubernetes, ecs, digitalocean

set -e

PLATFORM=${1:-"ssh"}
IMAGE_TAG=${2:-"latest"}

echo "🚀 Deploying Cosmiv backend to production..."
echo "📦 Platform: $PLATFORM"
echo "🏷️  Image tag: $IMAGE_TAG"

case $PLATFORM in
  railway)
    echo "🚂 Deploying to Railway..."
    railway up --service backend
    ;;
    
  render)
    echo "🎨 Deploying to Render..."
    render deploy --service cosmiv-backend
    ;;
    
  flyio)
    echo "✈️  Deploying to Fly.io..."
    flyctl deploy --app cosmiv-backend --image ghcr.io/$GITHUB_REPOSITORY-backend:$IMAGE_TAG
    ;;
    
  ssh)
    echo "🖥️  Deploying via SSH..."
    if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ]; then
      echo "❌ Error: SSH_HOST and SSH_USER must be set"
      exit 1
    fi
    ssh $SSH_USER@$SSH_HOST "cd /opt/cosmiv && docker-compose pull && docker-compose up -d"
    ;;
    
  kubernetes)
    echo "☸️  Deploying to Kubernetes..."
    if [ -z "$KUBECONFIG" ]; then
      echo "❌ Error: KUBECONFIG must be set"
      exit 1
    fi
    kubectl set image deployment/cosmiv-backend backend=ghcr.io/$GITHUB_REPOSITORY-backend:$IMAGE_TAG
    kubectl rollout status deployment/cosmiv-backend
    ;;
    
  ecs)
    echo "☁️  Deploying to AWS ECS..."
    if [ -z "$AWS_REGION" ] || [ -z "$ECS_CLUSTER" ] || [ -z "$ECS_SERVICE" ]; then
      echo "❌ Error: AWS_REGION, ECS_CLUSTER, and ECS_SERVICE must be set"
      exit 1
    fi
    aws ecs update-service \
      --cluster $ECS_CLUSTER \
      --service $ECS_SERVICE \
      --force-new-deployment \
      --region $AWS_REGION
    ;;
    
  digitalocean)
    echo "🌊 Deploying to DigitalOcean App Platform..."
    if [ -z "$DO_APP_ID" ]; then
      echo "❌ Error: DO_APP_ID must be set"
      exit 1
    fi
    doctl apps create-deployment $DO_APP_ID --force-rebuild
    ;;
    
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "Available platforms: railway, render, flyio, ssh, kubernetes, ecs, digitalocean"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"

