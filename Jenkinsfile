pipeline {

    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        PROJECT_NAME = "ResQhub"

        AWS_REGION = "us-east-1"
        AWS_ACCOUNT_ID = "737206603875"

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        EKS_CLUSTER = "resqhub-eks"
        K8S_NAMESPACE = "resqhub"
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
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "========================================"
                    echo "Building Frontend Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-frontend:latest \
                        ./frontend


                    echo ""
                    echo "========================================"
                    echo "Building User Service Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-user-service:latest \
                        ./services/user-service


                    echo ""
                    echo "========================================"
                    echo "Building Incident Service Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-incident-service:latest \
                        ./services/incident-service


                    echo ""
                    echo "========================================"
                    echo "Building Rescue Service Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-rescue-service:latest \
                        ./services/rescue-service


                    echo ""
                    echo "========================================"
                    echo "Building Resource Service Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-resource-service:latest \
                        ./services/resource-service


                    echo ""
                    echo "========================================"
                    echo "Building Notification Service Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-notification-service:latest \
                        ./services/notification-service


                    echo ""
                    echo "========================================"
                    echo "Building API Gateway Image"
                    echo "========================================"

                    docker build \
                        -t resqhub-api-gateway:latest \
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
                echo "Verifying ResQhub Docker images"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== ResQhub Docker Images ====="

                    docker images | grep resqhub

                    echo ""
                    echo "========================================"
                    echo "Docker image verification completed"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 7. AWS / ECR CHECK
        // ====================================================

        stage('AWS ECR Check') {

            steps {

                echo "========================================"
                echo "Checking AWS and ECR access"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== AWS Version ====="
                    aws --version

                    echo ""
                    echo "===== AWS Identity ====="
                    aws sts get-caller-identity

                    echo ""
                    echo "===== ECR Repositories ====="

                    aws ecr describe-repositories \
                        --region ${AWS_REGION} \
                        --query "repositories[].repositoryName" \
                        --output table

                    echo ""
                    echo "AWS and ECR access verified successfully."
                '''
            }
        }


        // ====================================================
        // 8. LOGIN TO ECR
        // ====================================================

        stage('Login to ECR') {

            steps {

                echo "========================================"
                echo "Logging in to AWS ECR"
                echo "========================================"

                sh '''
                    set -e

                    aws ecr get-login-password \
                        --region ${AWS_REGION} \
                    | docker login \
                        --username AWS \
                        --password-stdin ${ECR_REGISTRY}

                    echo ""
                    echo "Successfully logged in to ECR."
                '''
            }
        }


        // ====================================================
        // 9. TAG DOCKER IMAGES
        // ====================================================

        stage('Tag Docker Images') {

            steps {

                echo "========================================"
                echo "Tagging Docker images for ECR"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Tagging Frontend ====="

                    docker tag \
                        resqhub-frontend:latest \
                        ${ECR_REGISTRY}/resqhub-frontend:latest


                    echo ""
                    echo "===== Tagging User Service ====="

                    docker tag \
                        resqhub-user-service:latest \
                        ${ECR_REGISTRY}/resqhub-user-service:latest


                    echo ""
                    echo "===== Tagging Incident Service ====="

                    docker tag \
                        resqhub-incident-service:latest \
                        ${ECR_REGISTRY}/resqhub-incident-service:latest


                    echo ""
                    echo "===== Tagging Rescue Service ====="

                    docker tag \
                        resqhub-rescue-service:latest \
                        ${ECR_REGISTRY}/resqhub-rescue-service:latest


                    echo ""
                    echo "===== Tagging Resource Service ====="

                    docker tag \
                        resqhub-resource-service:latest \
                        ${ECR_REGISTRY}/resqhub-resource-service:latest


                    echo ""
                    echo "===== Tagging Notification Service ====="

                    docker tag \
                        resqhub-notification-service:latest \
                        ${ECR_REGISTRY}/resqhub-notification-service:latest


                    echo ""
                    echo "===== Tagging API Gateway ====="

                    docker tag \
                        resqhub-api-gateway:latest \
                        ${ECR_REGISTRY}/resqhub-api-gateway:latest


                    echo ""
                    echo "All Docker images tagged successfully."
                '''
            }
        }


        // ====================================================
        // 10. PUSH IMAGES TO ECR
        // ====================================================

        stage('Push Images to ECR') {

            steps {

                echo "========================================"
                echo "Pushing ResQhub images to ECR"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Pushing Frontend ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-frontend:latest


                    echo ""
                    echo "===== Pushing User Service ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-user-service:latest


                    echo ""
                    echo "===== Pushing Incident Service ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-incident-service:latest


                    echo ""
                    echo "===== Pushing Rescue Service ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-rescue-service:latest


                    echo ""
                    echo "===== Pushing Resource Service ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-resource-service:latest


                    echo ""
                    echo "===== Pushing Notification Service ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-notification-service:latest


                    echo ""
                    echo "===== Pushing API Gateway ====="

                    docker push \
                        ${ECR_REGISTRY}/resqhub-api-gateway:latest


                    echo ""
                    echo "========================================"
                    echo "All images pushed successfully to ECR"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 11. EKS CHECK
        // ====================================================

        stage('EKS Check') {

            steps {

                echo "========================================"
                echo "Checking EKS cluster"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Updating kubeconfig ====="

                    aws eks update-kubeconfig \
                        --region ${AWS_REGION} \
                        --name ${EKS_CLUSTER}

                    echo ""
                    echo "===== EKS Cluster ====="

                    kubectl cluster-info

                    echo ""
                    echo "===== EKS Nodes ====="

                    kubectl get nodes

                    echo ""
                    echo "===== ResQhub Namespace ====="

                    kubectl get namespace ${K8S_NAMESPACE}

                    echo ""
                    echo "EKS access verified successfully."
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
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Updating Frontend ====="

                    kubectl set image deployment/frontend \
                        frontend=${ECR_REGISTRY}/resqhub-frontend:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating User Service ====="

                    kubectl set image deployment/user-service \
                        user-service=${ECR_REGISTRY}/resqhub-user-service:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Incident Service ====="

                    kubectl set image deployment/incident-service \
                        incident-service=${ECR_REGISTRY}/resqhub-incident-service:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Rescue Service ====="

                    kubectl set image deployment/rescue-service \
                        rescue-service=${ECR_REGISTRY}/resqhub-rescue-service:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Resource Service ====="

                    kubectl set image deployment/resource-service \
                        resource-service=${ECR_REGISTRY}/resqhub-resource-service:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating Notification Service ====="

                    kubectl set image deployment/notification-service \
                        notification-service=${ECR_REGISTRY}/resqhub-notification-service:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Updating API Gateway ====="

                    kubectl set image deployment/api-gateway \
                        api-gateway=${ECR_REGISTRY}/resqhub-api-gateway:latest \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "========================================"
                    echo "EKS deployments updated successfully"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 13. ROLLOUT STATUS
        // ====================================================

        stage('Verify Rollout') {

            steps {

                echo "========================================"
                echo "Verifying Kubernetes rollout"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Frontend Rollout ====="

                    kubectl rollout status \
                        deployment/frontend \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== User Service Rollout ====="

                    kubectl rollout status \
                        deployment/user-service \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Incident Service Rollout ====="

                    kubectl rollout status \
                        deployment/incident-service \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Rescue Service Rollout ====="

                    kubectl rollout status \
                        deployment/rescue-service \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Resource Service Rollout ====="

                    kubectl rollout status \
                        deployment/resource-service \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== Notification Service Rollout ====="

                    kubectl rollout status \
                        deployment/notification-service \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "===== API Gateway Rollout ====="

                    kubectl rollout status \
                        deployment/api-gateway \
                        -n ${K8S_NAMESPACE}


                    echo ""
                    echo "========================================"
                    echo "All deployments rolled out successfully"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 14. VERIFY APPLICATION
        // ====================================================

        stage('Verify Application') {

            steps {

                echo "========================================"
                echo "Verifying ResQhub application"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Pods ====="

                    kubectl get pods \
                        -n ${K8S_NAMESPACE} \
                        -o wide


                    echo ""
                    echo "===== Deployments ====="

                    kubectl get deployments \
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
                    echo "ResQhub application verification completed"
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

            echo ""
            echo "Docker images built successfully."
            echo "Docker images pushed to AWS ECR."
            echo "Application deployed successfully to AWS EKS."
            echo "Kubernetes rollout completed successfully."
            echo "ResQhub application verification completed."

            echo ""
            echo "========================================"
            echo "GitHub -> Jenkins -> Docker -> ECR -> EKS"
            echo "========================================"
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
            echo "Jenkins build completed"
            echo "========================================"
        }
    }
}
