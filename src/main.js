const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')

const fs = require('node:fs/promises')
const child_process = require('node:child_process')
const { dangerfile } = require('./dangerfile')
// const { wait } = require('./wait')

const path = file => `${process.cwd()}/${file}`

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    core.info('↳ Installing danger')
    await exec.exec('npm i danger')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }

  try {
    core.info('↳ Installing dependencies')
    await exec.exec('npm i')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
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
    child_process.execSync('npx danger ci --failOnErrors', {
      stdio: 'inherit'
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
