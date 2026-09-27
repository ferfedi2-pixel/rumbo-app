# RUMBO · variante Lovable

Versión experimental construida a partir de la V1 original, en una rama separada. La aplicación publicada en producción y sus datos no se modifican.

## Ejecutar

Requiere Node.js 20 o superior.

```bash
npm ci
npm run dev
```

`npm run build` comprueba los tipos y produce `dist/`. `npm test` comprueba el motor de aportaciones.

## Estructura

- `src/domain/types.ts`: `Portfolio`, `Asset`, `Holding`, `RebalanceCalculation` y registro de aportaciones.
- `src/domain/rebalance.ts`: reparto con dinero entrante, desviaciones y ajuste completo **solo orientativo**.
- `src/domain/models.ts`: Refugio, Travesía y Cumbre, más cuatro modelos editables. Los pesos de los tres primeros parten de la referencia de la V1 original de 31/08/2026; no se actualizan automáticamente.
- `src/domain/projection.ts`: simulación mensual de capital, comisiones e inflación hipotéticas.
- `src/screens/`: las cinco pantallas. `Dashboard.tsx` y `ContributionScreen.tsx` son los componentes principales pedidos.
- `src/components/CompassDial.tsx`: dial SVG cuyo ángulo señala el activo más infraponderado cuando hay un desvío.
- `src/domain/store.ts`: almacenamiento local independiente bajo `rumbo_lovable_v1`.
- `public/manifest.webmanifest` y `public/sw.js`: instalación PWA y lectura de recursos ya visitados sin conexión.

El registro de una aportación requiere confirmar los importes que el usuario ha ejecutado fuera de RUMBO. No hay conexión bancaria, órdenes reales, autenticación ni custodia. El ajuste con ventas se muestra aparte, pero no se registra ni ejecuta. Las cifras de rentabilidad iniciales son hipótesis editables y no garantías.

Los datos de esta variante se guardan en el navegador y origen donde se abre. No aparecen automáticamente los saldos guardados en la V1 publicada en otro dominio.
