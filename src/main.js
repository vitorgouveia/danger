const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')

// const { wait } = require('./wait')

const dangerfile = `
async function App() {
  return "app"
}

;(async () => {
  console.log(App())
})();
`

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    core.info('↳ Installing dangerfile')
    // await exec.exec('npm i danger')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }

  try {
    core.info('↳ Installing dependencies')
    // await exec.exec('npm i')
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
    core.info('↳ Adding danger configuration')
    // await exec.exec(`echo $'${dangerfile}' >> test.md`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
