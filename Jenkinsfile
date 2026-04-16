pipeline {
    agent any

    environment {
        IMAGE_NAME = 'housekeeping-ui'
        CONTAINER_NAME = 'housekeeping_ui'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Set Version') {
            steps {
                sh "npm version --no-git-tag-version 1.0.${BUILD_NUMBER}"
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --coverage'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "sonar-scanner -Dsonar.projectKey=housekeeping-ui -Dsonar.projectName=\"Housekeeping UI\" -Dsonar.projectVersion=1.0.${BUILD_NUMBER} -Dsonar.sources=src -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info -Dsonar.token=\$SONAR_AUTH_TOKEN -Dsonar.qualitygate.wait=true"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Deploy') {
            steps {
                // UI is a static Nginx container — no secrets needed.
                // Stop the old container and start the new image.
                sh """
                    docker stop ${CONTAINER_NAME} 2>/dev/null || true
                    docker rm   ${CONTAINER_NAME} 2>/dev/null || true
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --network housekeeping_net \
                        --restart unless-stopped \
                        -p 8082:80 \
                        ${IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        success {
            echo 'UI deployed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
