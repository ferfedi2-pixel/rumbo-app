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
