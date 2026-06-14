'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui/state/ErrorState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container app-content" style={{ paddingTop: 24 }}>
      <ErrorState
        title="No pudimos cargar esta vista"
        description="Ocurrió un problema al obtener la información. Puedes intentar nuevamente."
        action={
          <button type="button" className="button button--primary" onClick={() => reset()}>
            Reintentar
          </button>
        }
      />
    </div>
  );
}
