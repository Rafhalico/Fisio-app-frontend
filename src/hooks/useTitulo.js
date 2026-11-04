import { useEffect } from 'react';

// Pone el título de la pestaña del navegador según la página.
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo
      ? `${titulo} · María Montaño Fisioterapia`
      : 'María Montaño Fisioterapia · Fisioterapia en Gilena';
  }, [titulo]);
}
