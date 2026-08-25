pipeline {

    agent any

    options {
        timestamps()
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

                bat '''
                    echo Current directory:
                    cd

                    echo.
                    echo Project files:
                    dir

                    echo.
                    echo Git version:
                    git --version
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

                bat '''
                    echo.
                    echo ===== Checking Python services =====
                    echo.

                    if exist user-service\\requirements.txt (
                        echo Installing User Service dependencies...
                        python -m pip install -r user-service\\requirements.txt
                    ) else (
                        echo User Service requirements.txt not found
                    )

                    if exist incident-service\\requirements.txt (
                        echo Installing Incident Service dependencies...
                        python -m pip install -r incident-service\\requirements.txt
                    ) else (
                        echo Incident Service requirements.txt not found
                    )

                    if exist rescue-service\\requirements.txt (
                        echo Installing Rescue Service dependencies...
                        python -m pip install -r rescue-service\\requirements.txt
                    ) else (
                        echo Rescue Service requirements.txt not found
                    )

                    if exist resource-service\\requirements.txt (
                        echo Installing Resource Service dependencies...
                        python -m pip install -r resource-service\\requirements.txt
                    ) else (
                        echo Resource Service requirements.txt not found
                    )

                    if exist notification-service\\requirements.txt (
                        echo Installing Notification Service dependencies...
                        python -m pip install -r notification-service\\requirements.txt
                    ) else (
                        echo Notification Service requirements.txt not found
                    )

                    if exist api-gateway\\requirements.txt (
                        echo Installing API Gateway dependencies...
                        python -m pip install -r api-gateway\\requirements.txt
                    ) else (
                        echo API Gateway requirements.txt not found
                    )

                    echo.
                    echo ===== Python version =====
                    python --version

                    echo.
                    echo ===== Build verification completed =====
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

                bat '''
                    echo Checking for test directories...

                    if exist tests (
                        echo Tests directory found.
                        python -m pytest tests -v
                    ) else (
                        echo No root tests directory found.
                    )

                    if exist user-service\\tests (
                        echo User Service tests found.
                        python -m pytest user-service\\tests -v
                    ) else (
                        echo No User Service tests found.
                    }

                    if exist incident-service\\tests (
                        echo Incident Service tests found.
                        python -m pytest incident-service\\tests -v
                    ) else (
                        echo No Incident Service tests found.
                    }

                    if exist rescue-service\\tests (
                        echo Rescue Service tests found.
                        python -m pytest rescue-service\\tests -v
                    ) else (
                        echo No Rescue Service tests found.
                    }

                    if exist resource-service\\tests (
                        echo Resource Service tests found.
                        python -m pytest resource-service\\tests -v
                    ) else (
                        echo No Resource Service tests found.
                    }

                    if exist notification-service\\tests (
                        echo Notification Service tests found.
                        python -m pytest notification-service\\tests -v
                    ) else (
                        echo No Notification Service tests found.
                    )

                    echo.
                    echo ===== Test stage completed =====
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

                bat '''
                    docker --version

                    echo.
                    echo Docker is available to Jenkins.
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