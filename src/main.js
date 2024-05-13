const core = require('@actions/core')
const exec = require('@actions/exec')

const fs = require('node:fs/promises')
const { dangerfile } = require('./dangerfile')

const path = file => `${process.cwd()}/${file}`

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
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
