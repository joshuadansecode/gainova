import { NextRequest, NextResponse } from 'next/server'

// FedaPay redirige ici après paiement
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  if (status === 'approved') {
    return NextResponse.redirect(new URL('/connexion?inscription=success', req.url))
  }

  return NextResponse.redirect(new URL('/rejoindre?error=paiement_echoue', req.url))
}
