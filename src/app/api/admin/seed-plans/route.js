import { NextResponse } from 'next/server';
import { seedPlans } from '@/app/actions/planActions';
import { getSessionUser } from '@/lib/core/session';

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await seedPlans();
    
    if (result.success) {
      return NextResponse.json({ message: 'Plans seeded successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Seed plans error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
