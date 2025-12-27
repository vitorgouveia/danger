import cache from '@actions/cache'
import core from '@actions/core'
import exec from '@actions/exec'
import { readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cache_path = ['node_modules']
const cache_key = 'danger-action-install'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  const dangerCached = await cache.restoreCache(cache_path, cache_key)

  if (!dangerCached) {
    try {
      core.info('↳ Installing danger')
      await exec.exec('npm i danger')
    } catch (error) {
      core.setFailed(error.message)
      return
    }

    try {
      await cache.saveCache(cache_path, cache_key)
      core.debug('danger saved to cache')
    } catch (error) {
      core.setFailed(error.message)
      return
    }
  }

  try {
    core.info('↳ Copying dangerfile and rules')

    // Copy dangerfile.js to project root
    const dangerfileSource = join(__dirname, 'dangerfile.js')
    const dangerfileDest = join(process.cwd(), 'dangerfile.js')
    const dangerfileContent = readFileSync(dangerfileSource, 'utf8')

    await fs.writeFile(dangerfileDest, dangerfileContent, 'utf8')

    // Copy rules directory to project root
    const rulesSourceDir = join(__dirname, 'rules')
    const rulesDestDir = join(process.cwd(), 'rules')

    // Create rules directory if it doesn't exist
    await fs.mkdir(rulesDestDir, { recursive: true })

    // Read all files in rules directory
    const rulesFiles = await fs.readdir(rulesSourceDir)

    // Copy each file (excluding README.md)
    for (const file of rulesFiles) {
      if (file.endsWith('.js')) {
        const sourceFile = join(rulesSourceDir, file)
        const destFile = join(rulesDestDir, file)
        const content = readFileSync(sourceFile, 'utf8')
        await fs.writeFile(destFile, content, 'utf8')
      }
    }
  } catch (error) {
    core.setFailed(`Failed to copy dangerfile: ${error.message}`)
    return
  }

  try {
    core.info('↳ Executing danger')
    await exec.exec('npx danger ci --failOnErrors')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
