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
                echo "Verifying ResQhub project"
                echo "========================================"

                sh '''
                    echo "Current directory:"
                    pwd

                    echo ""
                    echo "Project files:"
                    ls -la

                    echo ""
                    echo "Git version:"
                    git --version

                    echo ""
                    echo "Python version:"
                    python3 --version
                '''
            }
        }


        // ====================================================
        // 3. BUILD / DEPENDENCY CHECK
        // ====================================================

        stage('Build') {

            steps {

                echo "========================================"
                echo "Building ResQhub services"
                echo "========================================"

                sh '''
                    echo ""
                    echo "===== Checking Python services ====="
                    echo ""

                    if [ -f user-service/requirements.txt ]; then
                        echo "Installing User Service dependencies..."
                        python3 -m pip install -r user-service/requirements.txt
                    else
                        echo "User Service requirements.txt not found"
                    fi

                    if [ -f incident-service/requirements.txt ]; then
                        echo "Installing Incident Service dependencies..."
                        python3 -m pip install -r incident-service/requirements.txt
                    else
                        echo "Incident Service requirements.txt not found"
                    fi

                    if [ -f rescue-service/requirements.txt ]; then
                        echo "Installing Rescue Service dependencies..."
                        python3 -m pip install -r rescue-service/requirements.txt
                    else
                        echo "Rescue Service requirements.txt not found"
                    fi

                    if [ -f resource-service/requirements.txt ]; then
                        echo "Installing Resource Service dependencies..."
                        python3 -m pip install -r resource-service/requirements.txt
                    else
                        echo "Resource Service requirements.txt not found"
                    fi

                    if [ -f notification-service/requirements.txt ]; then
                        echo "Installing Notification Service dependencies..."
                        python3 -m pip install -r notification-service/requirements.txt
                    else
                        echo "Notification Service requirements.txt not found"
                    fi

                    if [ -f api-gateway/requirements.txt ]; then
                        echo "Installing API Gateway dependencies..."
                        python3 -m pip install -r api-gateway/requirements.txt
                    else
                        echo "API Gateway requirements.txt not found"
                    fi

                    echo ""
                    echo "===== Python version ====="
                    python3 --version

                    echo ""
                    echo "===== Build verification completed ====="
                '''
            }
        }


        // ====================================================
        // 4. TEST
        // ====================================================

        stage('Test') {

            steps {

                echo "========================================"
                echo "Running ResQhub tests"
                echo "========================================"

                sh '''
                    echo "Checking for test directories..."

                    if [ -d tests ]; then
                        echo "Tests directory found."
                        python3 -m pytest tests -v
                    else
                        echo "No root tests directory found."
                    fi

                    if [ -d user-service/tests ]; then
                        echo "User Service tests found."
                        python3 -m pytest user-service/tests -v
                    else
                        echo "No User Service tests found."
                    fi

                    if [ -d incident-service/tests ]; then
                        echo "Incident Service tests found."
                        python3 -m pytest incident-service/tests -v
                    else
                        echo "No Incident Service tests found."
                    fi

                    if [ -d rescue-service/tests ]; then
                        echo "Rescue Service tests found."
                        python3 -m pytest rescue-service/tests -v
                    else
                        echo "No Rescue Service tests found."
                    fi

                    if [ -d resource-service/tests ]; then
                        echo "Resource Service tests found."
                        python3 -m pytest resource-service/tests -v
                    else
                        echo "No Resource Service tests found."
                    fi

                    if [ -d notification-service/tests ]; then
                        echo "Notification Service tests found."
                        python3 -m pytest notification-service/tests -v
                    else
                        echo "No Notification Service tests found."
                    fi

                    echo ""
                    echo "===== Test stage completed ====="
                '''
            }
        }


        // ====================================================
        // 5. DOCKER CHECK
        // ====================================================

        stage('Docker Check') {

            steps {

                echo "========================================"
                echo "Checking Docker"
                echo "========================================"

                sh '''
                    docker --version

                    echo ""
                    echo "Docker is available to Jenkins."
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