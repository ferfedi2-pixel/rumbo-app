# RUMBO 3.4 · Pendiente de revisar

Estado: PENDIENTE de revisión visual de Felipe. No es la versión 3.5.
Base: `experiment/refinada-3-4`, commit `3aa8341aeb80b310945e0823ae86b1ccaf517ea2`.
Fecha: 12/11/2026.

## Motivo y alcance

Ajustes solicitados a partir de cinco capturas móviles: brújula ligeramente más baja, separación entre consulta de planes y registro de saldos, menor densidad y corrección del contraste del plan seleccionado.

- «Activos» pasa a «Planes»: plan activo primero, componentes y costes desplegables, alternativas debajo. Se distingue entre plan RUMBO y propio.
- Cartera: referencia compacta al plan y total después de los saldos.
- Aportar: importe exacto una sola vez; capital actual/objetivo, peso actual/objetivo y peso tras aportar. Se elimina la diferencia residual expresada en «pp» de la vista visible; se comparan pesos directamente.
- Se corrige la combinación de fondo claro y letras blancas al seleccionar un plan.
- La edición de un plan propio permanece provisional hasta confirmar; cancelar o cambiar de pestaña restaura la composición anterior.
- Se conserva la formación, la metodología de reparto y la información financiera de la base. Las fichas mantienen su fecha anterior de revisión de fuentes (20/10/2026); esta entrega no supone una nueva verificación de tarifas.

## Validación local

Chromium headless, anchos de 360, 390, 430 y 1440 px:

- Inicio, Cartera, Planes y Aportar sin desbordamiento horizontal.
- Inspección visual de inicio, saldos, planes, ficha de fondo, costes y reparto expandido.
- Cancelación y confirmación de cambio de plan conservan saldos; activos antiguos siguen contando en Cartera, pero no aparecen como objetivos en Planes.
- Plan propio: creación, edición, validación de suma al 100 %, cancelación y confirmación.
- Consultar detalles no modifica el estado.
- Caso Cumbre: saldos 20.499 / 2.321 / 14.722 / 3.291 €; total 40.833 €. Aportación de 1.000 €: 822,21 / 177,79 / 0 / 0 €. Capital objetivo de desarrollados: 25.813,05 €.
- Registro de la aportación: total 41.833 €, una entrada de historial.
- Importe cero desactiva el registro sin valores no numéricos.
- Sin errores de JavaScript. Comprobaciones sintácticas y `git diff --check` correctos.

Publicación prevista en rama de revisión independiente; no sustituir el enlace anterior ni promover a producción. Pendiente: comprobar despliegue y revisión de Felipe en su móvil antes de decidir 3.5.

## Segundo pase de revisión · Inicio, Cartera, Aportar y Horizonte

Base: `f7813103305f989058acdc7b2a187ca4c3374dd3`. Se mantiene la etiqueta «3.4 · Pendiente de revisar».

- Inicio: separación de miles también en cifras de cuatro dígitos. El gráfico sigue mostrando la distribución y el supuesto de rentabilidad se consulta en Horizonte.
- Cartera: «Saldos actuales» con una sola indicación de edición. Bajo cada activo se muestra la diferencia entre su peso actual y el objetivo en puntos porcentuales, con un decimal. Se omite si aún no hay saldo.
- Aportar: dos columnas, «Tras aportar» y «Objetivo», cada una con importe y peso. El objetivo se destaca en menta. El cálculo de reparto no cambia.
- Horizonte: saldo de partida, aportación mensual, rentabilidad y costes, en euros nominales. «Usar mi cartera» vuelve al saldo total, al importe indicado en Aportar y a los supuestos del plan activo. Se reutiliza el coste anual ponderado de la ficha por pesos objetivo, sin actualizar fuentes. En plan propio no se presupone rentabilidad ni coste. «Editar valores» abre los campos; «OK» aplica un escenario guardado por separado, sin modificar saldos, importe de Aportar ni plan. Se conserva el horizonte elegido al volver a los datos de cartera.

Validado en Chromium a 320, 360, 390, 430 y 1440 px. Se comprobaron los tres planes RUMBO y un plan propio, validación de importes, conservación del escenario tras recargar, descarte de cambios sin confirmar, recuperación de datos de cartera y actualización de los saldos de referencia. El caso de la captura de 39.326 € y 1.000 € de aportación muestra 22.239,46 € y 55,15 % tras aportar a Desarrollados, frente a 24.883,16 € y 61,71 % de objetivo. Se volvió a comprobar el registro de una aportación y los cambios de plan sin pérdida de saldos.

## Tercer pase de revisión · Accesos diarios y actualización de saldos

Base: `0e1a60d1a650e0ebfc200d2a880c35b773b12149`. Se mantiene «3.4 · Pendiente de revisar».

- La barra inferior conserva Inicio, Cartera, Aportar y Horizonte. Planes queda en el menú superior junto a Aprende y Ajustes. El inicio sin plan conserva el acceso directo para configurarlo.
- Inicio conserva total y gráfico; el desglose solo muestra nombres e importes. Cartera presenta el logo del plan activo y saldos con cifras más grandes.
- «Actualizar» valida todos los saldos antes de guardar el conjunto. Inicio, Cartera, Aportar y el modo de cartera de Horizonte reflejan los saldos confirmados.
- Cartera y Aportar muestran la diferencia entre el peso actual y el objetivo debajo del activo. En pantalla se usa el formato compacto con signo y %; la etiqueta accesible especifica puntos porcentuales. Si todavía no hay saldo, se omite la diferencia.
- Aportar tiene controles más compactos, cifras más grandes y muestra «Pausar» cuando el reparto es cero. Se mantiene el detalle desplegable y la metodología de reparto.

Comprobado en Chromium de 320 a 1440 px, con revisión visual a 390 px. Se verificaron los accesos, los logos, la validación conjunta sin guardados parciales, los saldos tras recargar y el reparto del caso anterior: 805,46 € y 194,54 €, con los dos activos restantes en pausa.
