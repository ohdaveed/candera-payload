import nextVitalsConfig from 'eslint-config-next/core-web-vitals'
import nextTsConfig from 'eslint-config-next/typescript'

const fixedPlugins = new Map()

/**
 * Removes circular references from ESLint plugin objects while preserving
 * reference consistency to prevent "Cannot redefine plugin" errors.
 */
function fixCircular(configs) {
  return configs.map((config) => {
    if (!config.plugins) return config
    const newPlugins = { ...config.plugins }
    let changed = false
    for (const name in newPlugins) {
      const plugin = newPlugins[name]
      if (!plugin) continue

      if (fixedPlugins.has(plugin)) {
        newPlugins[name] = fixedPlugins.get(plugin)
        if (newPlugins[name] !== plugin) changed = true
        continue
      }

      if (plugin.configs) {
        let hasCircular = false
        for (const configName in plugin.configs) {
          const pConfig = plugin.configs[configName]
          if (pConfig && pConfig.plugins && pConfig.plugins[name] === plugin) {
            hasCircular = true
            break
          }
        }

        if (hasCircular) {
          const newPlugin = { ...plugin, configs: { ...plugin.configs } }
          for (const configName in newPlugin.configs) {
            const pConfig = newPlugin.configs[configName]
            if (pConfig && pConfig.plugins && pConfig.plugins[name] === plugin) {
              newPlugin.configs[configName] = {
                ...pConfig,
                plugins: { ...pConfig.plugins },
              }
              delete newPlugin.configs[configName].plugins[name]
            }
          }
          fixedPlugins.set(plugin, newPlugin)
          newPlugins[name] = newPlugin
          changed = true
          continue
        }
      }
      fixedPlugins.set(plugin, plugin)
    }
    return changed ? { ...config, plugins: newPlugins } : config
  })
}

// We use nextVitalsConfig which typically includes nextTsConfig if needed.
// If we find that TypeScript rules are missing, we can add nextTsConfig back.
const eslintConfig = fixCircular([
  {
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts', 'Candera Design System/**'],
  },
  ...nextVitalsConfig,
  ...nextTsConfig,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
])

export default eslintConfig
