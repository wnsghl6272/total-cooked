import { NextRequest, NextResponse } from 'next/server';
import { getHeroImagePool, generateHeroImagePool, refreshHeroImagePool, shouldRefreshHeroPool } from '@/utils/heroImagePool';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const pool = await getHeroImagePool();
        const needsRefresh = await shouldRefreshHeroPool();
        return NextResponse.json({
          exists: !!pool,
          imageCount: pool?.images?.length || 0,
          lastUpdated: pool?.lastUpdated,
          currentIndex: pool?.currentIndex || 0,
          needsRefresh
        });

      case 'refresh':
        console.log('Force refreshing hero image pool via API...');
        const newPool = await refreshHeroImagePool();
        return NextResponse.json({
          success: true,
          message: 'Hero image pool refreshed successfully',
          imageCount: newPool.images.length,
          lastUpdated: newPool.lastUpdated
        });

      case 'initialize':
        const existingPool = await getHeroImagePool();
        if (existingPool && existingPool.images.length === 5) {
          return NextResponse.json({
            success: true,
            message: 'Hero image pool already exists',
            imageCount: existingPool.images.length,
            lastUpdated: existingPool.lastUpdated
          });
        }

        console.log('Initializing hero image pool via API...');
        const initializedPool = await generateHeroImagePool();
        return NextResponse.json({
          success: true,
          message: 'Hero image pool initialized successfully',
          imageCount: initializedPool.images.length,
          lastUpdated: initializedPool.lastUpdated
        });

      default:
        const currentPool = await getHeroImagePool();
        return NextResponse.json({
          success: true,
          pool: currentPool ? {
            imageCount: currentPool.images.length,
            lastUpdated: currentPool.lastUpdated,
            currentIndex: currentPool.currentIndex,
            imageUrls: currentPool.images.map(img => img.url)
          } : null
        });
    }
  } catch (error) {
    console.error('Hero pool API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage hero image pool' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'initialize') {
      console.log('Initializing hero image pool via POST...');
      const pool = await generateHeroImagePool();
      return NextResponse.json({
        success: true,
        message: 'Hero image pool initialized successfully',
        imageCount: pool.images.length,
        lastUpdated: pool.lastUpdated
      });
    }

    if (action === 'refresh') {
      console.log('Refreshing hero image pool via POST...');
      const pool = await refreshHeroImagePool();
      return NextResponse.json({
        success: true,
        message: 'Hero image pool refreshed successfully',
        imageCount: pool.images.length,
        lastUpdated: pool.lastUpdated
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Hero pool POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process hero pool request' },
      { status: 500 }
    );
  }
} 