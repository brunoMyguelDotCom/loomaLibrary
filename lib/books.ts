export type Book = {
  /** Identificador estável derivado do pathname do blob */
  id: string
  /** Nome de exibição do livro (sem extensão) */
  title: string
  /** URL pública do PDF no Vercel Blob */
  url: string
  /** Caminho no blob */
  pathname: string
  /** Tamanho em bytes */
  size: number
  /** Data de envio (ISO) */
  uploadedAt: string
}

/** Remove a extensão e embeleza o nome do arquivo para exibição. */
export function prettifyTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Gera uma cor de capa estável a partir do título. */
export function coverHue(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Mantém dentro da faixa de azuis/petróleo (190–260)
  return 190 + (Math.abs(hash) % 70)
}
