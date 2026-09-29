# RUMBO · Refinada 2

Base: experiment/v1-curated, commit 8bd06d5. Nueva rama independiente; no reemplaza producción ni anteriores versiones.

## Decisiones de esta entrega

- Conserva portada, modelos y activos de Refinada por indicación expresa del usuario, que prevalece sobre las prohibiciones del prompt auxiliar.
- Navegación: Inicio, Cartera, Activos, Aportar, Horizonte. Aprende en Inicio y menú.
- Iconos de modelos 25% más pequeños que Refinada. Símbolos de Bitcoin y Ethereum locales; iconos genéricos de globo para categorías geográficas, que no tienen logotipo propio.
- Plan activo compacto; saldos con jerarquía; detalle financiero desplegable.
- Horizonte con áreas hasta 30 años, supuestos editables y cifras principales sin decimales.
- Motor: adopta el reparto proporcional al déficit del prompt auxiliar, con mayor resto a céntimos. Sustituye la proyección previa de mínimos cuadrados; por tanto, algunas asignaciones difieren de V1. Objetivos cero con saldos positivos no pueden corregirse exactamente solo aportando.
- Las cifras grandes de aportación se redondean al euro; detalle y confirmación muestran céntimos. El registro usa importes exactos.
- Datos locales independientes: rumbo_refinada_2. No se importan datos automáticamente de versiones anteriores. Exportación JSON/CSV y borrado en Ajustes.
- Los modelos se conservan como ejemplos existentes. Sus escalas de riesgo propias no son indicadores regulatorios. No hay validación jurídica comercial implícita por el aviso educativo.

## Verificación

Recorrido real en Chromium a 390 px: selección y confirmación Cumbre, edición de cuatro saldos, cálculo, despliegue de detalles, Horizonte. Sin desbordamiento horizontal en las seis vistas a 320, 390, 430 y 1024 px. Todas las miniaturas cargan.

Caso del prompt: [7500,1600,900], pesos [70,20,10], aportación 500 => [0,384.62,115.38].

## Recursos

- Bitcoin: https://bitcoin.design/assets/images/guide/getting-started/visual-language/bitcoin-symbol.svg (bitboy, dominio público; documentación https://bitcoin.design/guide/getting-started/visual-language/).
- Ethereum: https://ethereum.org/assets/ ; imagen https://ethereum.org/_next/static/media/eth-diamond-black.31u_5ih2w7osr.png .
- Fuentes educativas y fecha visibles en cada módulo. Ejemplos numéricos propios e hipotéticos.

Pruebas adicionales: aportación 0 no registrable; negativa bloqueada; registro de 500 € incrementa el total en 500 €; recarga conserva importes e historial; editor 95% + 5 pasa a 100% y permite confirmar personalizada. No se detectaron errores JavaScript.

Publicación pendiente: revisión automática bloqueó push a ferfedi2-pixel/rumbo-app por requerir autorización específica de destino para esta rama. No se ha publicado ni modificado producción.
