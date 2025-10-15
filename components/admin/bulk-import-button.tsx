"use client"

import { useState } from "react"

export function BulkImportButton() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/admin/products/import", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Falha ao importar")
      setResult(json?.message || "Importado com sucesso!")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Importar via Excel/CSV</h3>
          <p className="text-sm text-muted-foreground">Envie o arquivo para inserir/atualizar produtos por SKU.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <a href="/templates/products_template.xlsx" className="text-sm underline">Baixar modelo (.xlsx)</a>
          <a href="/templates/products_template.csv" className="text-sm underline">(.csv)</a>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input
                     file:bg-background file:text-foreground file:text-sm hover:file:bg-muted"
        />
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                     bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Importando..." : "Importar"}
        </button>
      </div>

      {result && <p className="mt-3 text-sm text-green-600">{result}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-3 text-xs text-muted-foreground">
        Dicas: use <code>sku</code> como identificador único (upsert). “metadata.bullets” aceita itens separados por
        <code> | </code>. Campos vazios não apagam valores existentes.
      </div>
    </div>
  )
}
