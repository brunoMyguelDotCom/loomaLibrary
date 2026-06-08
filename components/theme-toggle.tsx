"use client"

import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
      }
      className="relative grid size-10 place-items-center rounded-full border border-border/70 bg-card/60 text-foreground/80 backdrop-blur transition-all duration-200 hover:bg-secondary hover:text-primary hover:border-primary/30 hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 rounded-full bg-primary/0 transition-colors duration-200 hover:bg-primary/5" />
      {theme === "dark" ? (
        <Sun className="size-[18px] transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-[18px] transition-transform duration-300" />
      )}
    </button>
  )
}
