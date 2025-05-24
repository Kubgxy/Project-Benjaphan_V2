pipeline {
  agent any

  options {
    skipDefaultCheckout()
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    DOCKER_COMPOSE_FILE = 'docker-compose.yml'
  }

  stages {
    stage('🔍 Git Clone') {
      steps {
        echo '📥 Cloning repo...'
        checkout scm
        sh 'ls -al Backend/uploads || echo "❌ uploads not found"'
        }
    }

    stage('📁 Debug path') {
        steps {
            sh '''
            echo "WORKSPACE = $WORKSPACE"
            pwd
            ls -al
            '''
        }
    }

    stage('🛰️ Check workspace path') {
        steps {
            sh '''
            echo "👉 Jenkins is running in workspace:"
            pwd
            echo "🔍 Listing:"
            ls -al
            '''
        }
    }

    stage('🧪 Validate uploads/') {
      steps {
        sh '''
          echo '📁 ตรวจสอบรูปที่อยู่ใน repo:'
          find Backend/uploads -type f || echo "❌ uploads มีแค่โฟลเดอร์เปล่า"
          ls -al Backend/uploads/products || echo "❌ ไม่มี products!"
          ls -al Backend/uploads/slips || echo "❌ ไม่มี slips!"
        '''
      }
    }

    stage('📂 Debug uploads volume') {
        steps {
            sh '''
            echo 📸 ตรวจสอบภาพใน uploads-data volume:
            docker exec backend ls -al /app/uploads/products || echo "❌ ไม่พบไฟล์ใน /app/uploads/products"
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
            echo "🔒 Writing secrets into Backend/.env"
            echo "MONGODB_URI=$MONGODB_URI" > Backend/.env
            echo "PORT=$PORT" >> Backend/.env
            echo "JWT_SECRET=$JWT_SECRET" >> Backend/.env
            echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> Backend/.env
            echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> Backend/.env
            echo "FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID" >> Backend/.env
            echo "FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET" >> Backend/.env
          '''
        }
      }
    }

    stage('♻️ Docker Down') {
      steps {
        sh 'docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true'
      }
    }

    stage('🐳 Docker Build') {
      steps {
        dir("${env.WORKSPACE}") {
          sh '''
            echo "🔨 Starting docker-compose build..."
            docker-compose -f $DOCKER_COMPOSE_FILE build --parallel || {
              echo "❌ Docker build failed"; exit 1;
            }
          '''
        }
      }
    }

    stage('🚀 Docker Up') {
      steps {
        sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d'
      }
    }

    stage('📂 Debug uploads volume') {
      steps {
        sh '''
          echo '📸 ตรวจสอบภาพใน uploads-data volume:'
          docker exec backend ls -al /app/uploads/products || echo "❌ ไม่มีภาพสินค้าใน container"
        '''
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
      }
    }
  }

  post {
    success {
      echo '✅ Deployment completed successfully 🎉'
    }
    failure {
      echo '❌ Deployment failed. Check logs for details.'
      sh 'docker-compose -f $DOCKER_COMPOSE_FILE logs || true'
    }
    always {
      echo '📋 Pipeline finished'
    }
  }
}
