import { loadEnvConfig } from '@next/env'
const projectDir = process.cwd()
loadEnvConfig(projectDir)

export default function config () {
  return {
    awsRegion: process.env.AWS_REGION || 'us-east-2',
    telepathUrl: process.env.TELEPATH_URL,
  }
}