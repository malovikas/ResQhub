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
        // 4. BUILD / DEPENDENCY CHECK
        // ====================================================

        stage('Build') {

            steps {

                echo "========================================"
                echo "Checking Python dependencies"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== User Service ====="
                    python3 -m pip install -r services/user-service/requirements.txt


                    echo ""
                    echo "===== Incident Service ====="
                    python3 -m pip install -r services/incident-service/requirements.txt


                    echo ""
                    echo "===== Rescue Service ====="
                    python3 -m pip install -r services/rescue-service/requirements.txt


                    echo ""
                    echo "===== Resource Service ====="
                    python3 -m pip install -r services/resource-service/requirements.txt


                    echo ""
                    echo "===== Notification Service ====="
                    python3 -m pip install -r services/notification-service/requirements.txt


                    echo ""
                    echo "===== API Gateway ====="
                    python3 -m pip install -r services/api-gateway/requirements.txt


                    echo ""
                    echo "========================================"
                    echo "Python dependency verification completed"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 5. TEST
        // ====================================================

        stage('Test') {

            steps {

                echo "========================================"
                echo "Running ResQhub tests"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Checking for test files ====="

                    TEST_FOUND=false


                    if [ -d tests ]; then

                        echo "Root tests directory found."

                        python3 -m pytest tests -v

                        TEST_FOUND=true

                    fi


                    if [ -d services/user-service/tests ]; then

                        echo "User Service tests found."

                        python3 -m pytest services/user-service/tests -v

                        TEST_FOUND=true

                    fi


                    if [ -d services/incident-service/tests ]; then

                        echo "Incident Service tests found."

                        python3 -m pytest services/incident-service/tests -v

                        TEST_FOUND=true

                    fi


                    if [ -d services/rescue-service/tests ]; then

                        echo "Rescue Service tests found."

                        python3 -m pytest services/rescue-service/tests -v

                        TEST_FOUND=true

                    fi


                    if [ -d services/resource-service/tests ]; then

                        echo "Resource Service tests found."

                        python3 -m pytest services/resource-service/tests -v

                        TEST_FOUND=true

                    fi


                    if [ -d services/notification-service/tests ]; then

                        echo "Notification Service tests found."

                        python3 -m pytest services/notification-service/tests -v

                        TEST_FOUND=true

                    fi


                    if [ -d services/api-gateway/tests ]; then

                        echo "API Gateway tests found."

                        python3 -m pytest services/api-gateway/tests -v

                        TEST_FOUND=true

                    fi


                    if [ "$TEST_FOUND" = false ]; then

                        echo ""
                        echo "No automated test directories found."
                        echo "Skipping test execution."

                    fi


                    echo ""
                    echo "========================================"
                    echo "Test stage completed"
                    echo "========================================"
                '''
            }
        }


        // ====================================================
        // 6. DOCKER CHECK
        // ====================================================

        stage('Docker Check') {

            steps {

                echo "========================================"
                echo "Checking Docker"
                echo "========================================"

                sh '''
                    set -e

                    docker --version

                    echo ""
                    echo "Checking Docker daemon..."

                    docker info > /dev/null

                    echo ""
                    echo "Docker daemon is running."
                    echo "Docker is available to Jenkins."
                '''
            }
        }


        // ====================================================
        // 7. BUILD DOCKER IMAGES
        // ====================================================

        stage('Build Docker Images') {

            steps {

                echo "========================================"
                echo "Building ResQhub Docker images"
                echo "========================================"

                sh '''
                    set -e

                    echo ""
                    echo "===== Building Frontend Image ====="

                    docker build \
                        -t resqhub-frontend:latest \
                        ./frontend


                    echo ""
                    echo "===== Building User Service Image ====="

                    docker build \
                        -t resqhub-user-service:latest \
                        ./services/user-service


                    echo ""
                    echo "===== Building Incident Service Image ====="

                    docker build \
                        -t resqhub-incident-service:latest \
                        ./services/incident-service


                    echo ""
                    echo "===== Building Rescue Service Image ====="

                    docker build \
                        -t resqhub-rescue-service:latest \
                        ./services/rescue-service


                    echo ""
                    echo "===== Building Resource Service Image ====="

                    docker build \
                        -t resqhub-resource-service:latest \
                        ./services/resource-service


                    echo ""
                    echo "===== Building Notification Service Image ====="

                    docker build \
                        -t resqhub-notification-service:latest \
                        ./services/notification-service


                    echo ""
                    echo "===== Building API Gateway Image ====="

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
        // 8. DOCKER IMAGES
        // ====================================================

        stage('Docker Images') {

            steps {

                echo "========================================"
                echo "Listing ResQhub Docker images"
                echo "========================================"

                sh '''
                    docker images | grep resqhub
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

            echo "All Docker images were built successfully."
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