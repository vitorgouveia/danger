export default {
  name: 'important-files',
  execute: async (msg, params, context) => {
    const { findModifiedFile } = context

    const importantFiles = ['Dockerfile', '.eslintrc', ...(params || [])]

    for (const file of importantFiles) {
      if (findModifiedFile(file)) {
        msg(`Atenção: O arquivo <strong>${file}</strong> foi atualizado.`)
      }
    }
  }
}
