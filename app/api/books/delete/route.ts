import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = await request.json()
    if (!pathname) {
      return NextResponse.json(
        { error: "Caminho não informado." },
        { status: 400 },
      )
    }
    await del(pathname)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro ao excluir:", error)
    return NextResponse.json(
      { error: "Falha ao excluir o livro." },
      { status: 500 },
    )
  }
}
