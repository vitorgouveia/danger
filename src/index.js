import cache from '@actions/cache'
import core from '@actions/core'
import exec from '@actions/exec'

import fs from 'node:fs/promises'
import { dangerfile } from './dangerfile.js'

const path = file => `${process.cwd()}/${file}`

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
    }

    try {
      await cache.saveCache(cache_path, cache_key)
      core.debug('danger saved to cache')
    } catch (error) {
      core.setFailed(error.message)
    }
  }

  try {
    core.info('↳ Adding dangerfile')
    const dangerfile_path = path('dangerfile.js')
    const dangerfile_content = dangerfile

    await fs.writeFile(dangerfile_path, dangerfile_content, 'utf8')
  } catch (error) {
    core.setFailed(error.message)
  }

  try {
    core.info('↳ Executing danger')
    await exec.exec('npx danger ci --failOnErrors')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
