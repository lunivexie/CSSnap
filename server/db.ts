import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("SUPABASE_URL or SUPABASE_ANON_KEY missing. DB will not function in production.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  nickname: string;
  xp: number;
  last_daily_date: string | null;
}

/**
 * Retrieves or creates a user in Supabase.
 */
export async function getUser(nickname: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', nickname)
    .single();

  if (error || !data) {
    const newUser = { nickname, xp: 0, last_daily_date: null };
    await supabase.from('users').insert([newUser]);
    return newUser;
  }

  return data as User;
}

/**
 * Updates player XP and daily streak in Supabase.
 */
export async function updateUserXP(nickname: string, xpToAdd: number, isDaily: boolean = false): Promise<User> {
  const user = await getUser(nickname);
  const newXp = (user.xp || 0) + xpToAdd;
  
  const updates: any = { xp: newXp };
  if (isDaily) {
    updates.last_daily_date = new Date().toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('nickname', nickname)
    .select()
    .single();

  return (data || user) as User;
}

/**
 * Logs match history to Supabase.
 */
export async function saveMatch(roomId: string, p1: string, p2: string, winner: string, score1: number, score2: number, mode: string) {
  await supabase.from('matches').insert([{
    id: roomId,
    player1: p1,
    player2: p2,
    winner,
    score1,
    score2,
    mode
  }]);
}
