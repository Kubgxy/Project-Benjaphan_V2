pipeline {
    agent any

    options {
        skipDefaultCheckout() // ไม่ checkout อัตโนมัติ
        timeout(time: 30, unit: 'MINUTES') // Timeout 30 นาที
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('🔄 Clean Workspace') {
            steps {
                cleanWs()
                echo "🧹 Cleaned Workspace"
            }
        }
        stage('🔍 Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Kubgxy/Project-Benjaphan_V2.git'
                echo '📥 Pulled latest code from repository'
            }
        }
        stage('📦 Confirm all upload folders') {
            steps {
                sh '''
                echo "✅ Checking all upload folders..."
                for dir in products articles avatars pages slips; do
                    if [ -d Backend/uploads/$dir ]; then
                    echo "📁 Found: $dir"
                    else
                    echo "❌ Missing: $dir"
                    fi
                done
                '''
            }
        }
        stage('🔐 Load Secrets') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
                    string(credentialsId: 'PORT', variable: 'PORT'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_CLIENT_SECRET'),
                    string(credentialsId: 'FACEBOOK_CLIENT_ID', variable: 'FACEBOOK_CLIENT_ID'),
                    string(credentialsId: 'FACEBOOK_CLIENT_SECRET', variable: 'FACEBOOK_CLIENT_SECRET')
                ]) {
                    sh '''
                        echo "MONGODB_URI=$MONGODB_URI" > Backend/.env
                        echo "JWT_SECRET=$JWT_SECRET" >> Backend/.env
                        echo "PORT=$PORT" >> Backend/.env
                        echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> Backend/.env
                        echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> Backend/.env
                        echo "FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID" >> Backend/.env
                        echo "FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET" >> Backend/.env
                        export MONGODB_URI JWT_SECRET PORT GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET FACEBOOK_CLIENT_ID FACEBOOK_CLIENT_SECRET
                    '''
                    echo '🔒 Secrets loaded into Backend/.env'
                }
            }
        }
        stage('♻️ Docker Down') {
            steps {
                sh 'docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true'
                echo '🗑️ Stopped and removed containers'
            }
        }
        stage('🐳 Docker Build') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE build --parallel'
                    echo '🏗️ Built Docker images'
                }
            }
        }
        stage('🚀 Docker Up') {
            steps {
                sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d'
                echo '🚀 Started Docker containers'
            }
        }
        stage('🧹 Docker Cleanup') {
            steps {
                sh '''
                echo "🧼 Cleaning unused Docker resources..."
                docker image prune -f --filter "until=24h" || true
                docker builder prune -f || true
                docker volume ls -qf dangling=true | xargs -r docker volume rm || true
                '''
                echo '🧽 Cleaned up unused Docker resources'
            }
        }
    }
    post {
        success {
            echo '✅ Deployment completed successfully 🎉'
        }
        failure {
            echo '❌ Deployment failed. Check logs for details.'
            sh 'docker-compose -f $DOCKER_COMPOSE_FILE logs'
        }
        always {
            echo '📝 Pipeline finished'
        }
    }
}