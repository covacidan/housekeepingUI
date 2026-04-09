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

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    docker stop ${CONTAINER_NAME} 2>/dev/null || true
                    docker rm ${CONTAINER_NAME} 2>/dev/null || true
                    docker run -d \\
                        --name ${CONTAINER_NAME} \\
                        --network housekeeping_net \\
                        --restart unless-stopped \\
                        -p 8082:80 \\
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
