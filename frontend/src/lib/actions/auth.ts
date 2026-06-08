"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const { error } = await supabase.auth.signUp({
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

  // Email confirmation is disabled for MVP testing, so we are logged in instantly.
  // The DB user will be created by the dashboard page fallback.
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Clear the DB user verification cache cookie
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('db_user_verified')

  redirect('/login')
}
