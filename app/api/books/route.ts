import { list } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prettifyTitle, type Book } from "@/lib/books"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "livros/" })

    const books: Book[] = blobs
      .filter((b) => b.pathname.toLowerCase().endsWith(".pdf"))
      .map((b) => {
        const filename = b.pathname.split("/").pop() || "livro.pdf"
        return {
          id: encodeURIComponent(b.pathname),
          title: prettifyTitle(filename),
          // Store privado: servimos o PDF pela nossa própria rota
          url: `/api/books/file?pathname=${encodeURIComponent(b.pathname)}`,
          pathname: b.pathname,
          size: b.size,
          uploadedAt:
            typeof b.uploadedAt === "string"
              ? b.uploadedAt
              : b.uploadedAt.toISOString(),
        }
      })
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))

    return NextResponse.json({ books })
  } catch (error) {
    console.error("[v0] Erro ao listar livros:", error)
    return NextResponse.json(
      { error: "Não foi possível carregar a biblioteca." },
      { status: 500 },
    )
  }
}
