export default {
  name: 'verify-deps',
  execute: async (msg, _, context) => {
    const { danger, findModifiedFile } = context

    if (!findModifiedFile('package.json')) return

    const findDiffDependencies = (diffDependencies, type) => {
      const newDevDependencies = []
      const updatedDevDependencies = []
      const dependencies = Object.keys(diffDependencies.after)

      for (const devDependency of dependencies) {
        const versionBefore = diffDependencies.before[devDependency]
        const versionAfter = diffDependencies.after[devDependency]

        if (versionAfter && !versionBefore) {
          newDevDependencies.push(
            `${devDependency} - ${versionAfter.replace('^', '')}`
          )
        }

        if (versionBefore && versionAfter !== versionBefore) {
          updatedDevDependencies.push(
            `${devDependency} - De ${versionBefore.replace('^', '')} para ${versionAfter.replace('^', '')}`
          )
        }
      }

      if (newDevDependencies.length) {
        msg(
          `Novas ${type} instaladas neste PR: <br/>` +
            ` ${newDevDependencies.join('<br/>')}`
        )
      }

      if (updatedDevDependencies.length) {
        msg(
          `${type} foram atualizadas neste PR: <br/> ` +
            ` ${updatedDevDependencies.join('<br/>')} `
        )
      }
    }

    const packageDiff = await danger.git.JSONDiffForFile('package.json')

    if (packageDiff.devDependencies) {
      findDiffDependencies(
        packageDiff.devDependencies,
        'dependências de desenvolvimento'
      )
    }

    if (packageDiff.dependencies) {
      findDiffDependencies(packageDiff.dependencies, 'dependências')
    }
  }
}
