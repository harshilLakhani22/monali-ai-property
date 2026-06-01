import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session?.user) {
        const user = data.session.user;
        let dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
        });

        if (!dbUser) {
            const org = await prisma.organization.create({
                data: { name: 'My Workspace' }
            });

            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    organizationId: org.id,
                }
            });
        }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
