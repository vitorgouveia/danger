import importantFiles from './important-files.js'
import outdatedDeps from './outdated-deps.js'
import roadmap from './roadmap.js'
import verifyDeps from './verify-deps.js'
import verifyDescription from './verify-description.js'
import verifyDocs from './verify-docs.js'
import verifyTests from './verify-tests.js'

const rules = [
  verifyDescription,
  verifyTests,
  verifyDocs,
  roadmap,
  importantFiles,
  verifyDeps,
  outdatedDeps
]

export function getRulesMap() {
  return rules.reduce((acc, rule) => {
    acc[rule.name] = rule
    return acc
  }, {})
}
