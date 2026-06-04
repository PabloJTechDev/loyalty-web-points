import { metricsRegistry } from '@/lib/metrics';

export async function GET() {
  const body = await metricsRegistry.metrics();

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': metricsRegistry.contentType,
      'Cache-Control': 'no-store',
    },
  });
}
