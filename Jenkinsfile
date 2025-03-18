pipeline {
    agent any
    
    environment {
        NODEJS_HOME = tool name: '18.0.0'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        GITHUB_TOKEN = credentials('GitHub_Credential')
        FRONTEND_IMAGE_NAME = 'aajb13/sgd-frontend'
        BACKEND_IMAGE_NAME = 'aajb13/sgd-backend'
        IMAGE_VERSION = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage ('GitHub') {
            steps {
                git branch: 'main', 
                credentialsId: 'GitHub_Credential', 
                url: 'https://github.com/AAJB13/SGD.git'
            }
        }
        
        stage('Check Commit Message') {
            steps {
                script {
                    // Get the latest commit message
                    def commitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    echo "Latest commit message: ${commitMessage}"

                    // Skip the build if the commit message contains a specific keyword (e.g., [skip ci])
                    if (commitMessage.contains('[skip ci]')) {
                        echo "Skipping build because the commit message contains '[skip ci]'."
                        currentBuild.result = 'FAILURE' // Abort the build
                        error("Build aborted due to commit message containing '[skip ci]'.")
                    }
                }
            }
        }
        
        stage ('Docker Version') {
            steps {
                echo 'Docker Version...'
                sh 'docker --version'
            }
        }
        
        stage ('Run Frontend and Backend in Parallel') {
            parallel {
                stage ('Frontend Pipeline') {
                    stages {
                        stage ('Install Frontend Dependencies') {
                            steps {
                                dir ('frontend') {
                                    echo 'Installing Frontend Dependencies...'
                                    sh 'npm install'
                                }
                            }
                        }
                        stage ('Frontend Test') {
                            steps {
                                dir ('frontend') {
                                    echo 'Testing Frontend...'
                                    //sh 'npm test'
                                }
                            }
                        }
                        stage ('Frontend Docker Build') {
                            steps{
                                dir ('frontend') {
                                    echo 'Frontend Docker Build...'
                                    sh 'docker build -t $FRONTEND_IMAGE_NAME:$IMAGE_VERSION .'
                                }
                            }
                        }
                        stage ('Frontend Login to GHCR') {
                            steps {
                                sh 'echo $GITHUB_TOKEN_PSW | docker login ghcr.io -u $GITHUB_TOKEN_USR --password-stdin'
                            }
                        }
                        stage ('Frontend Tag Image') {
                            steps {
                                sh 'docker tag $FRONTEND_IMAGE_NAME:$IMAGE_VERSION ghcr.io/$FRONTEND_IMAGE_NAME:$IMAGE_VERSION'
                            }
                        }
                        stage ('Frontend Push Image') {
                            steps {
                                sh 'docker push ghcr.io/$FRONTEND_IMAGE_NAME:$IMAGE_VERSION'
                            }
                        }
                        stage ('Frontend Logout from GHCR') {
                            steps {
                                sh 'docker logout ghcr.io'
                                }
                        }
                    }
                }
                stage ('Backend Pipeline') {
                    stages {
                        stage ('Install Backend Dependencies') {
                            steps {
                                dir ('Backend') {
                                    echo 'Installing Backend Dependencies...'
                                    sh 'npm install'
                                }
                            }
                            
                        }
                        stage ('Backend Test') {
                            steps {
                                dir ('frontend') {
                                    echo 'Testing Backend...'
                                    // sh 'npm test'
                                }
                            }
                        }
                        stage ('Backend Docker Build') {
                            steps{
                                dir ('backend') {
                                    echo 'Backend Docker Build...'
                                    sh 'docker build -t $BACKEND_IMAGE_NAME:$IMAGE_VERSION .'
                                }
                            }
                        }
                        stage ('Backend Login to GHCR') {
                            steps {
                                sh 'echo $GITHUB_TOKEN_PSW | docker login ghcr.io -u $GITHUB_TOKEN_USR --password-stdin'
                            }
                        }
                        stage ('Backend Tag Image') {
                            steps {
                                sh 'docker tag $BACKEND_IMAGE_NAME:$IMAGE_VERSION ghcr.io/$BACKEND_IMAGE_NAME:$IMAGE_VERSION'
                            }
                        }
                        stage ('Backend Push Image') {
                            steps {
                                sh 'docker push ghcr.io/$BACKEND_IMAGE_NAME:$IMAGE_VERSION'
                            }
                        }
                        stage ('Backend Logout from GHCR') {
                            steps {
                                sh 'docker logout ghcr.io'
                            }
                        }
                    }
                }
            }
        }
        stage ('Trigger Manifest Update') {
            steps {
                echo 'Triggering Manifest Update...'
                build job: 'SGDecodingGithubManifest', parameters: [string(name: 'DOCKERTAG', value: "${IMAGE_VERSION}")]
            }
        }
    }
}
