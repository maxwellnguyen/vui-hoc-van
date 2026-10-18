import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export const USERNAME_DOMAIN = 'bienchu.local'
export const usernameToEmail = (username: string) =>
  `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`
