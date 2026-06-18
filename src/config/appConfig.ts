function readEnvString(value: string | undefined, fallback: string): string {
  const trimmedValue = value?.trim()
  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback
}

export const appConfig = {
  name: readEnvString(import.meta.env.VITE_APP_NAME, 'Portfolio Dashboard'),
  subtitle: readEnvString(import.meta.env.VITE_APP_SUBTITLE, 'Backtest Workspace'),
  navLabel: readEnvString(import.meta.env.VITE_APP_NAV_LABEL, 'Workspace'),
  mark: readEnvString(import.meta.env.VITE_APP_MARK, 'PD'),
  primaryActionLabel: readEnvString(
    import.meta.env.VITE_APP_PRIMARY_ACTION_LABEL,
    'New Run',
  ),
  titleSuffix: readEnvString(import.meta.env.VITE_APP_TITLE_SUFFIX, 'Template'),
  description: readEnvString(
    import.meta.env.VITE_APP_DESCRIPTION,
    'Portfolio dashboard template for backtest research workflows.',
  ),
}

export function getAppDocumentTitle(): string {
  return `${appConfig.name} - ${appConfig.titleSuffix}`
}
