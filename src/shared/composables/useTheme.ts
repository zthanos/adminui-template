import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'corporate'

const THEME_STORAGE_KEY = 'app-theme'
const DEFAULT_THEME: Theme = 'light'

// Shared state across all instances
const currentTheme = ref<Theme>(DEFAULT_THEME)

export function useTheme() {
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'corporate']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const loadTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (savedTheme && ['light', 'dark', 'corporate'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      setTheme(DEFAULT_THEME)
    }
  }

  // Initialize theme on mount
  onMounted(() => {
    loadTheme()
  })

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    loadTheme
  }
}
