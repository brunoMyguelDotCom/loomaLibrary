import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
// PDFs podem ser grandes
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 },
      )
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são aceitos." },
        { status: 400 },
      )
    }

    const blob = await put(`livros/${file.name}`, file, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/pdf",
    })

    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error("[v0] Erro no upload:", error)
    return NextResponse.json(
      { error: "Falha ao enviar o livro." },
      { status: 500 },
    )
  }
}
