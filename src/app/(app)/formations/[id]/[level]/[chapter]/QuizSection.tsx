'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Quiz = {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

export default function QuizSection({
  quizzes,
  chapterId,
  userId,
  alreadyPassed,
  nextChapterId,
  formationId,
  levelId,
}: {
  quizzes: Quiz[]
  chapterId: string
  userId: string
  alreadyPassed: boolean
  nextChapterId?: string
  formationId: string
  levelId: string
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(alreadyPassed)
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const options = ['a', 'b', 'c', 'd'] as const

  async function handleSubmit() {
    if (Object.keys(answers).length < quizzes.length) return
    setLoading(true)

    const correct = quizzes.filter(q => answers[q.id] === q.correct_answer).length
    const passed = correct >= Math.ceil(quizzes.length * 0.7) // 70% pour valider

    setScore(correct)
    setSubmitted(passed)

    await fetch('/api/formations/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapter_id: chapterId, quiz_passed: passed }),
    })

    setLoading(false)
  }

  if (alreadyPassed || (submitted && score !== null && score >= Math.ceil(quizzes.length * 0.7))) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-semibold text-green-800 mb-2">Quiz validé !</h3>
        {nextChapterId ? (
          <a
            href={`/formations/${formationId}/${levelId}/${nextChapterId}`}
            className="inline-block mt-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Chapitre suivant →
          </a>
        ) : (
          <div>
            <p className="text-green-700 text-sm mb-3">🎉 Tu as terminé ce niveau !</p>
            <a href={`/formations/${formationId}`} className="text-green-600 underline text-sm">
              Retour à la formation
            </a>
          </div>
        )}
      </div>
    )
  }

  if (submitted && score !== null) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">❌</div>
        <h3 className="font-semibold text-red-800 mb-2">{score}/{quizzes.length} — Essaie encore</h3>
        <p className="text-red-600 text-sm mb-4">Il faut au moins 70% pour valider le chapitre.</p>
        <button
          onClick={() => { setSubmitted(false); setAnswers({}) }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="font-semibold text-gray-900 mb-6">📝 Quiz de validation</h2>
      <div className="space-y-6">
        {quizzes.map((q, i) => (
          <div key={q.id}>
            <p className="font-medium text-gray-800 mb-3">{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {options.map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    answers[q.id] === opt ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    className="accent-green-600"
                  />
                  <span className="text-sm text-gray-700">{q[`option_${opt}` as keyof Quiz]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || Object.keys(answers).length < quizzes.length}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Validation...' : 'Valider le quiz'}
      </button>
    </div>
  )
}
