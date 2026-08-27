pipeline {

    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {

        PROJECT_NAME = "ResQhub"

        AWS_REGION = "us-east-1"

        AWS_ACCOUNT_ID = "737206603875"

        ECR_REGISTRY = "737206603875.dkr.ecr.us-east-1.amazonaws.com"

        EKS_CLUSTER = "resqhub-eks"

        K8S_NAMESPACE = "resqhub"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        // ====================================================
        // 1. CHECKOUT
        // ====================================================

        stage('Checkout') {

            steps {

                echo "========================================"
                echo "Checking out ResQhub source code"
                echo "========================================"

                checkout scm
            }
        }


        // ====================================================
        // 2. VERIFY PROJECT
        // ====================================================

        stage('Verify Project') {

            steps {

                echo "========================================"
                echo "Verifying ResQhub project structure"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Current Directory ====="
                    pwd

                    echo ""
                    echo "===== Project Files ====="
                    ls -la

                    echo ""
                    echo "===== Frontend ====="
                    ls -la frontend

                    echo ""
                    echo "===== Services ====="
                    ls -la services

                    echo ""
                    echo "===== Git Version ====="
                    git --version

                    echo ""
                    echo "===== Python Version ====="
                    python3 --version

                    echo ""
                    echo "===== Docker Version ====="
                    docker --version
                '''
            }
        }


        // ====================================================
        // 3. VERIFY SERVICES
        // ====================================================

        stage('Verify Services') {

            steps {

                echo "========================================"
                echo "Verifying ResQhub services"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== User Service ====="

                    test -f services/user-service/app.py
                    test -f services/user-service/requirements.txt
                    test -f services/user-service/Dockerfile

                    echo "User Service: OK"


                    echo ""
                    echo "===== Incident Service ====="

                    test -f services/incident-service/app.py
                    test -f services/incident-service/requirements.txt
                    test -f services/incident-service/Dockerfile

                    echo "Incident Service: OK"


                    echo ""
                    echo "===== Rescue Service ====="

                    test -f services/rescue-service/app.py
                    test -f services/rescue-service/requirements.txt
                    test -f services/rescue-service/Dockerfile

                    echo "Rescue Service: OK"


                    echo ""
                    echo "===== Resource Service ====="

                    test -f services/resource-service/app.py
                    test -f services/resource-service/requirements.txt
                    test -f services/resource-service/Dockerfile

                    echo "Resource Service: OK"


                    echo ""
                    echo "===== Notification Service ====="

                    test -f services/notification-service/app.py
                    test -f services/notification-service/requirements.txt
                    test -f services/notification-service/Dockerfile

                    echo "Notification Service: OK"


                    echo ""
                    echo "===== API Gateway ====="

                    test -f services/api-gateway/app.py
                    test -f services/api-gateway/requirements.txt
                    test -f services/api-gateway/Dockerfile

                    echo "API Gateway: OK"


                    echo ""
                    echo "===== Frontend ====="

                    test -f frontend/Dockerfile

                    echo "Frontend Dockerfile: OK"


                    echo ""
                    echo "========================================"
                    echo "All ResQhub services verified successfully"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 4. DOCKER CHECK
        // ====================================================

        stage('Docker Check') {

            steps {

                echo "========================================"
                echo "Checking Docker"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Docker Version ====="
                    docker --version

                    echo ""
                    echo "===== Docker Daemon ====="
                    docker info > /dev/null

                    echo "Docker daemon is running."
                    echo "Docker is available to Jenkins."
                '''
            }
        }


        // ====================================================
        // 5. BUILD DOCKER IMAGES
        // ====================================================

        stage('Build Docker Images') {

            steps {

                echo "========================================"
                echo "Building ResQhub Docker images"
                echo "Image Tag: ${IMAGE_TAG}"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Building Frontend ====="

                    docker build \
                        -t resqhub-frontend:${IMAGE_TAG} \
                        ./frontend


                    echo ""
                    echo "===== Building User Service ====="

                    docker build \
                        -t resqhub-user-service:${IMAGE_TAG} \
                        ./services/user-service


                    echo ""
                    echo "===== Building Incident Service ====="

                    docker build \
                        -t resqhub-incident-service:${IMAGE_TAG} \
                        ./services/incident-service


                    echo ""
                    echo "===== Building Rescue Service ====="

                    docker build \
                        -t resqhub-rescue-service:${IMAGE_TAG} \
                        ./services/rescue-service


                    echo ""
                    echo "===== Building Resource Service ====="

                    docker build \
                        -t resqhub-resource-service:${IMAGE_TAG} \
                        ./services/resource-service


                    echo ""
                    echo "===== Building Notification Service ====="

                    docker build \
                        -t resqhub-notification-service:${IMAGE_TAG} \
                        ./services/notification-service


                    echo ""
                    echo "===== Building API Gateway ====="

                    docker build \
                        -t resqhub-api-gateway:${IMAGE_TAG} \
                        ./services/api-gateway


                    echo ""
                    echo "========================================"
                    echo "All Docker images built successfully"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 6. VERIFY DOCKER IMAGES
        // ====================================================

        stage('Verify Docker Images') {

            steps {

                echo "========================================"
                echo "Verifying Docker images"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== ResQhub Docker Images ====="

                    docker images | grep resqhub

                    echo ""
                    echo "Docker image verification completed."
                '''
            }
        }


        // ====================================================
        // 7. LOGIN TO AMAZON ECR
        // ====================================================

        stage('Login to ECR') {

            steps {

                echo "========================================"
                echo "Logging in to Amazon ECR"
                echo "========================================"

                sh '''
                    set -e

                    aws sts get-caller-identity

                    aws ecr get-login-password \
                        --region ${AWS_REGION} | \
                    docker login \
                        --username AWS \
                        --password-stdin ${ECR_REGISTRY}

                    echo "Successfully logged in to Amazon ECR."
                '''
            }
        }


        // ====================================================
        // 8. TAG IMAGES FOR ECR
        // ====================================================

        stage('Tag Images for ECR') {

            steps {

                echo "========================================"
                echo "Tagging Docker images for ECR"
                echo "========================================"

                sh '''
                    set -e

                    docker tag \
                        resqhub-frontend:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-frontend:${IMAGE_TAG}

                    docker tag \
                        resqhub-user-service:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-user-service:${IMAGE_TAG}

                    docker tag \
                        resqhub-incident-service:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-incident-service:${IMAGE_TAG}

                    docker tag \
                        resqhub-rescue-service:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-rescue-service:${IMAGE_TAG}

                    docker tag \
                        resqhub-resource-service:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-resource-service:${IMAGE_TAG}

                    docker tag \
                        resqhub-notification-service:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-notification-service:${IMAGE_TAG}

                    docker tag \
                        resqhub-api-gateway:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/resqhub-api-gateway:${IMAGE_TAG}


                    echo ""
                    echo "All images tagged for ECR."
                '''
            }
        }


        // ====================================================
        // 9. PUSH IMAGES TO ECR
        // ====================================================

        stage('Push Images to ECR') {

            steps {

                echo "========================================"
                echo "Pushing Docker images to Amazon ECR"
                echo "========================================"

                sh '''
                    set -e

                    echo "Pushing frontend..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-frontend:${IMAGE_TAG}

                    echo "Pushing user-service..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-user-service:${IMAGE_TAG}

                    echo "Pushing incident-service..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-incident-service:${IMAGE_TAG}

                    echo "Pushing rescue-service..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-rescue-service:${IMAGE_TAG}

                    echo "Pushing resource-service..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-resource-service:${IMAGE_TAG}

                    echo "Pushing notification-service..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-notification-service:${IMAGE_TAG}

                    echo "Pushing api-gateway..."
                    docker push \
                        ${ECR_REGISTRY}/resqhub-api-gateway:${IMAGE_TAG}


                    echo ""
                    echo "========================================"
                    echo "All images pushed to ECR successfully"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 10. VERIFY ECR
        // ====================================================

        stage('Verify ECR Images') {

            steps {

                echo "========================================"
                echo "Verifying images in Amazon ECR"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Frontend ====="

                    aws ecr describe-images \
                        --repository-name resqhub-frontend \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "===== User Service ====="

                    aws ecr describe-images \
                        --repository-name resqhub-user-service \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "===== Incident Service ====="

                    aws ecr describe-images \
                        --repository-name resqhub-incident-service \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "===== Rescue Service ====="

                    aws ecr describe-images \
                        --repository-name resqhub-rescue-service \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "===== Resource Service ====="

                    aws ecr describe-images \
                        --repository-name resqhub-resource-service \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "===== Notification Service ====="

                    aws ecr describe-images \
                        --repository-name resqhub-notification-service \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "===== API Gateway ====="

                    aws ecr describe-images \
                        --repository-name resqhub-api-gateway \
                        --image-ids imageTag=${IMAGE_TAG} \
                        --region ${AWS_REGION}


                    echo ""
                    echo "All ECR images verified successfully."
                '''
            }
        }


        // ====================================================
        // 11. CONFIGURE EKS
        // ====================================================

        stage('Configure EKS') {

            steps {

                echo "========================================"
                echo "Configuring kubectl for EKS"
                echo "========================================"

                sh '''
                    set -e

                    aws eks update-kubeconfig \
                        --name ${EKS_CLUSTER} \
                        --region ${AWS_REGION}

                    echo ""
                    echo "===== EKS Cluster ====="

                    aws eks describe-cluster \
                        --name ${EKS_CLUSTER} \
                        --region ${AWS_REGION} \
                        --query 'cluster.status' \
                        --output text


                    echo ""
                    echo "===== Kubernetes Nodes ====="

                    kubectl get nodes


                    echo ""
                    echo "EKS configuration successful."
                '''
            }
        }


        // ====================================================
        // 12. DEPLOY TO EKS
        // ====================================================

        stage('Deploy to EKS') {

            steps {

                echo "========================================"
                echo "Deploying ResQhub to EKS"
                echo "Image Tag: ${IMAGE_TAG}"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Updating Frontend ====="

                    kubectl set image deployment/frontend \
                        frontend=${ECR_REGISTRY}/resqhub-frontend:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating User Service ====="

                    kubectl set image deployment/user-service \
                        user-service=${ECR_REGISTRY}/resqhub-user-service:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Incident Service ====="

                    kubectl set image deployment/incident-service \
                        incident-service=${ECR_REGISTRY}/resqhub-incident-service:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Rescue Service ====="

                    kubectl set image deployment/rescue-service \
                        rescue-service=${ECR_REGISTRY}/resqhub-rescue-service:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Resource Service ====="

                    kubectl set image deployment/resource-service \
                        resource-service=${ECR_REGISTRY}/resqhub-resource-service:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Notification Service ====="

                    kubectl set image deployment/notification-service \
                        notification-service=${ECR_REGISTRY}/resqhub-notification-service:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating API Gateway ====="

                    kubectl set image deployment/api-gateway \
                        api-gateway=${ECR_REGISTRY}/resqhub-api-gateway:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "All Kubernetes deployments updated."
                '''
            }
        }


        // ====================================================
        // 13. ROLLOUT STATUS
        // ====================================================

        stage('Rollout Status') {

            steps {

                echo "========================================"
                echo "Checking Kubernetes rollout status"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Frontend Rollout ====="

                    kubectl rollout status \
                        deployment/frontend \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "===== User Service Rollout ====="

                    kubectl rollout status \
                        deployment/user-service \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "===== Incident Service Rollout ====="

                    kubectl rollout status \
                        deployment/incident-service \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "===== Rescue Service Rollout ====="

                    kubectl rollout status \
                        deployment/rescue-service \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "===== Resource Service Rollout ====="

                    kubectl rollout status \
                        deployment/resource-service \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "===== Notification Service Rollout ====="

                    kubectl rollout status \
                        deployment/notification-service \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "===== API Gateway Rollout ====="

                    kubectl rollout status \
                        deployment/api-gateway \
                        -n ${K8S_NAMESPACE} \
                        --timeout=180s


                    echo ""
                    echo "========================================"
                    echo "All deployments rolled out successfully"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 14. VERIFY DEPLOYMENT
        // ====================================================

        stage('Verify Deployment') {

            steps {

                echo "========================================"
                echo "Verifying ResQhub deployment"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Deployments ====="

                    kubectl get deployments \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Pods ====="

                    kubectl get pods \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Services ====="

                    kubectl get services \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Container Images ====="

                    kubectl get deployments \
                        -n ${K8S_NAMESPACE} \
                        -o jsonpath='{range .items[*]}{.metadata.name}{" -> "}{.spec.template.spec.containers[0].image}{"\\n"}{end}'


                    echo ""
                    echo "========================================"
                    echo "ResQhub deployment verification completed"
                    echo "========================================"
                '''
            }
        }
    }


    // ========================================================
    // POST BUILD
    // ========================================================

    post {

        success {

            echo "========================================"
            echo "RESQHUB CI/CD PIPELINE SUCCESSFUL"
            echo "========================================"

            echo "Build Number: ${BUILD_NUMBER}"
            echo "Branch: ${env.BRANCH_NAME}"
            echo "Project: ${PROJECT_NAME}"
            echo "Image Tag: ${IMAGE_TAG}"

            echo ""
            echo "Docker images built successfully."
            echo "Images pushed to Amazon ECR."
            echo "Images deployed to Amazon EKS."
            echo "Kubernetes rollout completed successfully."
        }


        failure {

            echo "========================================"
            echo "RESQHUB CI/CD PIPELINE FAILED"
            echo "========================================"

            echo "Build Number: ${BUILD_NUMBER}"
            echo "Check the Jenkins console output."
        }


        always {

            echo "========================================"
            echo "Jenkins pipeline execution completed"
            echo "========================================"
        }
    }
}
```

