zpipeline {
  agent any

  options {
    skipDefaultCheckout() // ไม่ checkout อัตโนมัติ
    timeout(time: 30, unit: 'MINUTES') // Timeout 30 นาที
  }

  parameters {
    booleanParam(
      name: 'USE_NO_CACHE',
      defaultValue: false,
      description: 'เลือกว่าจะใช้ --no-cache หรือไม่'
    )
    booleanParam(
      name: 'CLEAN_VOLUMES',
      defaultValue: false,
      description: 'เลือกว่าจะลบ volumes หรือไม่ (ระวัง: ลบ yarn_cache และ mongo-data)'
    )
  }

  environment {
    COMPOSE_DOCKER_CLI_BUILD = '1'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('🔄 Clean Workspace') {
      steps {
        deleteDir()
        echo "🧹 Cleaned workspace at WORKSPACE"
      }
    }

    stage('📥 Checkout Source Code') {
      steps {
        checkout scm
        sh 'cp -r /var/jenkins_home/workspace/Benjaphan-Deploy/* /opt/jenkins_workspace/Benjaphan-Deploy/ || true'
        echo '📥 Checked out source code and copied to /opt/jenkins_workspace/Benjaphan-Deploy'
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
          echo '🔒 Secrets loaded into environment'
        }
      }
    }

    stage('♻️ Docker Down') {
      steps {
        sh 'docker-compose down --remove-orphans || true'
        script {
          if (params.CLEAN_VOLUMES) {
            sh 'docker volume rm $(docker volume ls -q) || true'
            echo '🗑️ Cleared all Docker volumes'
          }
        }
      }
    }

    stage('📦 Warm Yarn Cache') {
      steps {
        script {
          withEnv([
            "MONGODB_URI=${env.MONGODB_URI}",
            "PORT=${env.PORT}",
            "JWT_SECRET=${env.JWT_SECRET}",
            "GOOGLE_CLIENT_ID=${env.GOOGLE_CLIENT_ID}",
            "GOOGLE_CLIENT_SECRET=${env.GOOGLE_CLIENT_SECRET}",
            "FACEBOOK_CLIENT_ID=${env.FACEBOOK_CLIENT_ID}",
            "FACEBOOK_CLIENT_SECRET=${env.FACEBOOK_CLIENT_SECRET}",
            "NODE_ENV=production"
          ]) {
            sh '''
              docker-compose run --rm backend sh -c "corepack enable && corepack prepare yarn@4.5.2 --activate && yarn install --immutable --immutable-cache"
              docker-compose run --rm frontend sh -c "corepack enable && corepack prepare yarn@4.5.2 --activate && yarn install --immutable --immutable-cache"
              docker-compose run --rm dashboard sh -c "corepack enable && corepack prepare yarn@4.5.2 --activate && yarn install --immutable --immutable-cache"
            '''
            echo '📦 Warmed up yarn_cache'
          }
        }
      }
    }

    stage('🐳 Docker Build') {
      steps {
        dir('/opt/jenkins_workspace/Benjaphan-Deploy') {
          script {
            def composeCmd = params.USE_NO_CACHE ? 'docker-compose build --no-cache --parallel' : 'docker-compose build --parallel'
            withEnv([
              "MONGODB_URI=${env.MONGODB_URI}",
              "PORT=${env.PORT}",
              "JWT_SECRET=${env.JWT_SECRET}",
              "GOOGLE_CLIENT_ID=${env.GOOGLE_CLIENT_ID}",
              "GOOGLE_CLIENT_SECRET=${env.GOOGLE_CLIENT_SECRET}",
              "FACEBOOK_CLIENT_ID=${env.FACEBOOK_CLIENT_ID}",
              "FACEBOOK_CLIENT_SECRET=${env.FACEBOOK_CLIENT_SECRET}",
              "NODE_ENV=production"
            ]) {
              sh composeCmd
              echo '🏗️ Built Docker images'
            }
          }
        }
      }
    }

    stage('🚀 Docker Up') {
      steps {
        dir('/opt/jenkins_workspace/Benjaphan-Deploy') {
          withEnv([
            "MONGODB_URI=${env.MONGODB_URI}",
            "PORT=${env.PORT}",
            "JWT_SECRET=${env.JWT_SECRET}",
            "GOOGLE_CLIENT_ID=${env.GOOGLE_CLIENT_ID}",
            "GOOGLE_CLIENT_SECRET=${env.GOOGLE_CLIENT_SECRET}",
            "FACEBOOK_CLIENT_ID=${env.FACEBOOK_CLIENT_ID}",
            "FACEBOOK_CLIENT_SECRET=${env.FACEBOOK_CLIENT_SECRET}",
            "NODE_ENV=production"
          ]) {
            sh 'docker-compose up -d'
            echo '🚀 Started Docker containers'
          }
        }
      }
    }

    stage('🧹 Docker Cleanup') {
      steps {
        sh '''
          docker image prune -af --filter "until=24h" || true
          docker builder prune -af || true
          docker volume prune -f || true
        '''
        echo '🧼 Cleaned up Docker resources'
      }
    }
  }

  post {
    success {
      echo '✅ Deployment completed successfully 🎉'
    }
    failure {
      echo '❌ Deployment failed. Check logs for details.'
      sh 'docker-compose logs'
    }
    always {
      echo '📝 Pipeline finished'
    }
  }
}
