#! /usr/bin/env groovy
pipeline {
  agent { label 'docker' }
  stages {
    stage('Build') {
      steps {
        sh 'docker-compose build --pull'
        // Start a container once to create a network, otherwise there could be
        // a race condition in the parallel stages below.
        sh 'docker-compose run --rm -dT --name=web_test web'
      }
    }
    stage('Verify') {
      parallel {
        stage('Test') {
          steps {
            sh 'docker exec web_test npm run test-cov'
            sh 'docker cp $(docker ps -q -f "name=web_test"):/usr/src/app/coverage coverage'
            sh 'docker stop web_test'
          }
        }
        stage('Security') {
          steps {
            withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
              sh 'docker-compose run --rm -T --name=web_security -e SNYK_TOKEN=$SNYK_TOKEN web npm run security:dependency-monitor || true'
            }
          }
        }
        stage('Lint') {
          steps {
            sh 'docker-compose run --rm -dT --name=web_lint web npm run lint'
          }
        }
        stage('Formatting') {
          steps {
            sh 'docker-compose run --rm -dT --name=web_formatting web npm run fmt:check'
          }
        }
      }
    }
    stage('Push latest to Starlord') {
      when { environment name: "GERRIT_EVENT_TYPE", value: "change-merged" }

      steps {
        script {
          withMultiPlatformBuilder {
            def imageTag = "starlord.inscloudgate.net/jenkins/canvas-rce-api"
            sh """
              docker buildx build \
                --builder multi-platform-builder \
                --cache-from=type=registry,ref=${imageTag} \
                --cache-to=type=local,dest=canvas-rce-api/cache_result \
                --pull \
                --push \
                --platform=linux/amd64,linux/arm64 \
                --tag "${imageTag}:latest" \
                --tag "${imageTag}:master" \
                .
            """
          }
        }

      }
    }
  }
  post {
    cleanup {
        sh 'docker-compose down --volumes --remove-orphans --rmi all'
    }
  }
}
