/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vscode: {
          'editor-background': 'var(--vscode-editor-background)',
          'editor-foreground': 'var(--vscode-editor-foreground)',
          'editor-inactiveSelectionBackground': 'var(--vscode-editor-inactiveSelectionBackground)',
          'editor-selectionHighlightBackground': 'var(--vscode-editor-selectionHighlightBackground)',
          'editor-selectionBackground': 'var(--vscode-editor-selectionBackground)',
          'button-background': 'var(--vscode-button-background)',
          'button-foreground': 'var(--vscode-button-foreground)',
          'button-hoverBackground': 'var(--vscode-button-hoverBackground)',
          'button-secondaryBackground': 'var(--vscode-button-secondaryBackground)',
          'button-secondaryForeground': 'var(--vscode-button-secondaryForeground)',
          'button-secondaryHoverBackground': 'var(--vscode-button-secondaryHoverBackground)',
          'dropdown-background': 'var(--vscode-dropdown-background)',
          'dropdown-foreground': 'var(--vscode-dropdown-foreground)',
          'input-background': 'var(--vscode-input-background)',
          'input-foreground': 'var(--vscode-input-foreground)',
          'input-placeholderForeground': 'var(--vscode-input-placeholderForeground)',
          'inputValidation-errorBackground': 'var(--vscode-inputValidation-errorBackground)',
          'inputValidation-errorForeground': 'var(--vscode-inputValidation-errorForeground)',
          'inputValidation-errorBorder': 'var(--vscode-inputValidation-errorBorder)',
          'list-activeSelectionBackground': 'var(--vscode-list-activeSelectionBackground)',
          'list-activeSelectionForeground': 'var(--vscode-list-activeSelectionForeground)',
          'list-hoverBackground': 'var(--vscode-list-hoverBackground)',
          'list-inactiveSelectionBackground': 'var(--vscode-list-inactiveSelectionBackground)',
          'sideBar-background': 'var(--vscode-sideBar-background)',
          'sideBar-foreground': 'var(--vscode-sideBar-foreground)',
          'tab-activeBackground': 'var(--vscode-tab-activeBackground)',
          'tab-activeForeground': 'var(--vscode-tab-activeForeground)',
          'tab-inactiveBackground': 'var(--vscode-tab-inactiveBackground)',
          'tab-inactiveForeground': 'var(--vscode-tab-inactiveForeground)',
        }
      },
      fontFamily: {
        'vscode': 'var(--vscode-editor-font-family)'
      }
    },
  },
  plugins: [],
}

