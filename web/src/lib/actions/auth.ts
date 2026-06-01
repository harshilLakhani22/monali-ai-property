"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password) return { error: 'Email and password are required' }

  const supabase = await createClient()

  const { headers } = await import('next/headers')
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    let dbUser = await prisma.user.findUnique({
      where: { email: data.user.email! }
    });

    if (!dbUser) {
      const org = await prisma.organization.create({
        data: {
          name: 'My Workspace',
        }
      });

      dbUser = await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          organizationId: org.id,
        }
      });
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
