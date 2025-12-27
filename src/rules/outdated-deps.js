import { execSync } from 'node:child_process'

export default {
  name: 'outdated-deps',
  execute: async msg => {
    try {
      const output = execSync('npm outdated --json || true')
      const json = JSON.parse(output.toString())
      const entries = Object.entries(json)

      const packagesToUpdate = entries.map(obj => {
        const [packageName, { current, latest }] = obj

        return `${packageName} - Atual ${current} - Última ${latest}`
      })

      if (packagesToUpdate.length) {
        msg(
          'Dependências com novas versões disponíveis: <br/>' +
            ` ${packagesToUpdate.join('<br/>')} `
        )
      }
    } catch (error) {
      console.log("Failed to execute 'npm outdated'", error)
    }
  }
}
