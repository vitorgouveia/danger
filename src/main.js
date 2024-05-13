const core = require('@actions/core')
const exec = require('@actions/exec')
const cache = require('@actions/cache')

const fs = require('node:fs/promises')
const { dangerfile } = require('./dangerfile')

const path = file => `${process.cwd()}/${file}`

const paths = ['node_modules']
const key = 'danger-action-install'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  const dangerCached = await cache.restoreCache(paths, key)

  if (!dangerCached) {
    try {
      core.info('↳ Installing danger')
      // TODO: cache this call
      await exec.exec('npm i danger')
    } catch (error) {
      // Fail the workflow run if an error occurs
      core.setFailed(error.message)
    }

    try {
      await cache.saveCache(paths, key)
      core.info('danger saved to cache')
    } catch (error) {
      // Fail the workflow run if an error occurs
      core.setFailed(error.message)
    }
  }

  // try {
  //   io.core.info('↳ Reading .danger.json configuration file')
  //   await exec.exec('npm i')
  // } catch (error) {
  //   // Fail the workflow run if an error occurs
  //   core.setFailed(error.message)
  // }

  try {
    core.info('↳ Adding dangerfile')
    const dangerfile_path = path('dangerfile.js')
    const dangerfile_content = dangerfile

    await fs.writeFile(dangerfile_path, dangerfile_content, 'utf8')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }

  try {
    core.info('↳ Executing danger')
    await exec.exec('npx danger ci --failOnErrors')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
