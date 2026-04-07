'use client'

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
    >
      Copier
    </button>
  )
}
