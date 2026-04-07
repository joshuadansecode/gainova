import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-2xl font-bold text-green-600">Gainova</span>
        <div className="flex gap-4">
          <Link href="/connexion" className="text-gray-600 hover:text-gray-900">Connexion</Link>
          <Link href="/rejoindre" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            {"S'inscrire"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Apprends, partage et <span className="text-green-600">gagne</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {"Accède à des formations gratuites, rejoins une communauté active et gagne des commissions en parrainant tes proches."}
        </p>
        <Link href="/rejoindre" className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 inline-block">
          Rejoindre pour 1 050 FCFA
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: '📚', title: '19 formations gratuites', desc: 'Accès immédiat après inscription à tous les niveaux débutant et intermédiaire.' },
          { icon: '💰', title: 'Gagne en parrainant', desc: '210 FCFA par personne parrainée. Sans limite. Versement via Mobile Money.' },
          { icon: '🛠️', title: 'Prestations digitales', desc: 'CV, logo, site web… commande directement sur la plateforme.' },
        ].map((f) => (
          <div key={f.title} className="text-center p-6 rounded-xl border hover:shadow-md transition">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
