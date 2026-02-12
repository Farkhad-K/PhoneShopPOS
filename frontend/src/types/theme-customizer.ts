export interface ThemeConfig {
  radius: string
  theme: string
  variant: 'default' | 'sidebar' | 'floating' | 'inset'
  collapsible: 'offcanvas' | 'icon' | 'none'
  side: 'left' | 'right'
}

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

export interface ImportedTheme {
  name: string
  config: ThemeConfig
  light?: Record<string, string>
  dark?: Record<string, string>
}

export interface ColorTheme {
  name: string
  value: string
  preset: ThemePreset
}

export type SidebarVariant = {
  name: string
  value: 'default' | 'sidebar' | 'floating' | 'inset'
  description: string
}

export type SidebarCollapsibleOption = {
  name: string
  value: 'offcanvas' | 'icon' | 'none'
  description?: string
}

export type SidebarSideOption = {
  name: string
  value: 'left' | 'right'
}

export type RadiusOption = {
  name: string
  value: string
}

export type BrandColor = {
  name: string
  value?: string
  cssVar?: string
}

export const sidebarVariants: SidebarVariant[] = [
  { name: 'Default', value: 'default', description: 'Default sidebar' },
  { name: 'Sidebar', value: 'sidebar', description: 'Sidebar with border' },
  { name: 'Floating', value: 'floating', description: 'Floating sidebar' },
  { name: 'Inset', value: 'inset', description: 'Inset sidebar' },
]

export const sidebarCollapsibleOptions: SidebarCollapsibleOption[] = [
  { name: 'Off Canvas', value: 'offcanvas' },
  { name: 'Icon', value: 'icon' },
  { name: 'None', value: 'none' },
]

export const sidebarSideOptions: SidebarSideOption[] = [
  { name: 'Left', value: 'left' },
  { name: 'Right', value: 'right' },
]

export const radiusOptions: RadiusOption[] = [
  { name: '0', value: '0' },
  { name: '0.3', value: '0.3' },
  { name: '0.5', value: '0.5' },
  { name: '0.75', value: '0.75' },
  { name: '1.0', value: '1.0' },
]

export const baseColors: BrandColor[] = [
  { name: 'Zinc', value: 'zinc' },
  { name: 'Slate', value: 'slate' },
  { name: 'Stone', value: 'stone' },
  { name: 'Gray', value: 'gray' },
  { name: 'Neutral', value: 'neutral' },
  { name: 'Red', value: 'red' },
  { name: 'Rose', value: 'rose' },
  { name: 'Orange', value: 'orange' },
  { name: 'Green', value: 'green' },
  { name: 'Blue', value: 'blue' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Violet', value: 'violet' },
]
