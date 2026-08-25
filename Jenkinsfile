pipeline {

    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        PROJECT_NAME = "ResQhub"
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
    }


    // ========================================================
    // POST BUILD
    // ========================================================

    post {

        success {

            echo "========================================"
            echo "RESQHUB CI BUILD SUCCESSFUL"
            echo "========================================"

            echo "Build Number: ${BUILD_NUMBER}"
            echo "Branch: ${env.BRANCH_NAME}"
            echo "Project: ${PROJECT_NAME}"

            echo ""
            echo "All ResQhub Docker images were built successfully."
        }


        failure {

            echo "========================================"
            echo "RESQHUB CI BUILD FAILED"
            echo "========================================"

            echo "Check the Jenkins console output."
        }


        always {

            echo "========================================"
            echo "Jenkins build completed"
            echo "========================================"
        }
    }
}