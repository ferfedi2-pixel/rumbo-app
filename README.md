# Versión 1: Perplexity

Experimento separado basado en RUMBO V1. Mantiene HTML, CSS, JavaScript, localStorage, las cuatro vistas y el cálculo existente. Los identificadores internos de las estrategias se conservan para respetar los datos previos: `refugio` se muestra como Horizonte y `horizonte` se muestra como Equilibrio. Son nombres de esta variante; RUMBO V1 conserva Refugio y Travesía.

La presentación de esta variante usa un tablero claro: paisaje en una franja superior, pasos de inicio, valor registrado separado, resumen y datos en tarjetas blancas, y panel de aportación destacado en verde. Los modelos mantienen tres tonos distintos. La composición y los estilos están en `perplexity.css`; la V1 original no utiliza ese archivo.

Para probarlo, sirve esta carpeta desde un servidor web. La ruta `/api/market` requiere Vercel; si falla, la aplicación mantiene la última referencia guardada y su fecha. La API calcula el peso relativo de ETH entre BTC y ETH con las cuotas de capitalización que publica CoinGecko: `ETH / (BTC + ETH)`. Los datos antiguos de la V1 usan una cuota global distinta y aparecen como referencia pendiente de actualización.

Los datos se guardan bajo `perplexity_v1`. Si no existen, se copia una vez la lectura de `rumbo_v1`, sin modificar esa clave.

La proyección usa las hipótesis anuales existentes en la V1 (5 %, 6 %, 8,5 % para las tres estrategias) y una tasa constante. No son rendimientos observados ni previsiones. No incorpora inflación, fiscalidad ni costes. Se mantiene un solo escenario, porque las hipótesis de otros dos no están definidas.

Recorrido manual recomendado: abrir sin datos; escoger una estrategia; introducir saldos; calcular y registrar una aportación; consultar la proyección; revisar el plan y conservar los saldos; intentar aplicar una cartera personalizada que no sume 100 %; recargar la página; simular un fallo de `/api/market`; comprobar móvil y escritorio.
