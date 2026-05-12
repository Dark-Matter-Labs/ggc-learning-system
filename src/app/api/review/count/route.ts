import { createClient } from '@/lib/supabase/server';
import { getKnowledgeReviewTypes } from '@/lib/config/captureTypes';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ count: flaggedCount }, { count: learningsCount }] = await Promise.all([
    supabase
      .from('nodes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'flagged_for_review'),
    supabase
      .from('nodes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'llm_reviewed')
      .in('node_type', getKnowledgeReviewTypes() as string[]),
  ]);

  return NextResponse.json({ count: (flaggedCount ?? 0) + (learningsCount ?? 0) });
}
