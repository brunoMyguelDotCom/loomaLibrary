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
      className="grid size-10 place-items-center rounded-full border border-border bg-card/60 text-foreground/80 backdrop-blur transition-colors hover:bg-secondary hover:text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="size-[18px]" />
      ) : (
        <Moon className="size-[18px]" />
      )}
    </button>
  )
}
