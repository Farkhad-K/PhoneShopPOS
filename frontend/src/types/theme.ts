export interface ThemePreset {
  name?: string
  label: string
  activeColor?: {
    light: string
    dark: string
  }
  cssVars?: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  styles?: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  createdAt?: string
}

export interface ColorTheme {
  name: string
  value: string
  preset: ThemePreset
}

export interface ThemeConfig {
  radius: string
  theme: string
  variant: 'default' | 'sidebar' | 'floating' | 'inset'
  collapsible: 'offcanvas' | 'icon' | 'none'
  side: 'left' | 'right'
}
