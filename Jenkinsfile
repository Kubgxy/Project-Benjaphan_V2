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
    always {
      echo '📋 Pipeline finished'

      script {
        def now = new Date().format("yyyy-MM-dd'T'HH:mm:ssZ"), utc = TimeZone.getTimeZone('UTC+07:00')
        def isSuccess = currentBuild.result == 'null' || currentBuild.result == 'SUCCESS'
        def message = isSuccess ?
          '{ "content": "======================================\\n✅ Deployment completed successfully 🚀🎉\\n📦 โปรเจค: Benjaphan5\\n⏰ เวลา: ' + now + '\\n======================================" }' :
          '{ "content": "======================================\\n❌ Deployment failed. Check logs for details 🔥🧨\\n📦 โปรเจค: Benjaphan5\\n⏰ เวลา: ' + now + '\\n======================================" }'
        def file = isSuccess ? 'discord-success.json' : 'discord-failure.json'
        writeFile file: file, text: message

        // ดึง webhook จาก Jenkins Credentials
        withCredentials([string(credentialsId: 'Discord_WEBHOOK', variable: 'DISCORD_WEBHOOK')]) {
          sh """
            curl -X POST -H "Content-Type: application/json" -d @$file $DISCORD_WEBHOOK
          """
        }
      }
    }
    success {
      echo '✅ Deployment completed successfully 🎉'
    }
    failure {
      echo '❌ Deployment failed. Check logs for details.'
      sh 'docker-compose -f $DOCKER_COMPOSE_FILE logs || true'
    }
  }
}