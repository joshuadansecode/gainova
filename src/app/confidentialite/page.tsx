export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Politique de Confidentialité</h1>
      <p className="text-sm text-gray-500 mb-8">Gainova — Version 1.0 — Avril 2026</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>Gainova accorde une importance primordiale à la protection de vos données personnelles. En créant un compte, vous acceptez la présente Politique de Confidentialité.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Données collectées</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nom, email, téléphone (lors de l&apos;inscription)</li>
            <li>Adresse IP, navigateur, pages visitées</li>
            <li>Progression dans les formations, publications, commandes</li>
            <li>Historique des parrainages et commissions</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">Gainova ne stocke pas vos données bancaires — les paiements sont traités par FedaPay.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour gérer votre compte, traiter les paiements, envoyer des notifications, améliorer les services et prévenir les fraudes.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Partage des données</h2>
          <p>Gainova ne vend jamais vos données. Elles peuvent être partagées uniquement avec FedaPay (paiements), nos prestataires techniques, ou les autorités légales si requis.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Conservation</h2>
          <p>Vos données sont conservées pendant la durée de vie de votre compte. En cas de suppression, elles sont effacées sous 30 jours (sauf obligations légales : 5 ans).</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Vos droits</h2>
          <p>Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition. Pour les exercer : <a href="mailto:support@gainova.com" className="text-blue-600 underline">support@gainova.com</a></p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p>Email : <a href="mailto:support@gainova.com" className="text-blue-600 underline">support@gainova.com</a></p>
        </div>
      </section>
    </div>
  )
}
