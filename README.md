# Versión 1: Perplexity

Experimento separado basado en RUMBO V1. Mantiene HTML, CSS, JavaScript, localStorage, las cuatro vistas y el cálculo existente. Los identificadores internos de las estrategias se conservan para respetar los datos previos: `refugio` se muestra como Horizonte y `horizonte` se muestra como Equilibrio.

Para probarlo, sirve esta carpeta desde un servidor web. La ruta `/api/market` requiere Vercel; si falla, la aplicación mantiene la última referencia guardada y su fecha.

Los datos se guardan bajo `perplexity_v1`. Si no existen, se copia una vez la lectura de `rumbo_v1`, sin modificar esa clave.
