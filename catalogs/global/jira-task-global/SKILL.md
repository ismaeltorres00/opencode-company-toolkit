---
name: jira-task-global
description: Redactar en español títulos, descripciones y registros de trabajo para tareas, subtareas, bugs, mejoras y spikes de análisis en Jira con un estilo práctico, humano y técnico. Usar cuando el usuario pida crear, revisar, mejorar o resumir una tarea de Jira; convertir una incidencia, correo, captura o notas técnicas en un ticket; proponer un título; redactar una descripción funcional o técnica; o transformar cambios realizados en un registro de trabajo. Mantener tecnicismos en inglés cuando sea natural, evitar sobreestructurar tareas pequeñas y no inventar requisitos, métricas ni decisiones no aportadas.
---

# Jira Task Author

Redactar contenido listo para pegar en Jira, adaptando profundidad y estructura al tamaño real de la tarea y al público.

## Principios de estilo

- Escribir en español y conservar tecnicismos habituales en inglés: `frontend`, `backend`, `API`, `endpoint`, `post-booking`, `businessTags`, `2FA`, `SFTP`, `loading`, etc.
- Mantener un tono humano, directo y profesional. Evitar lenguaje grandilocuente, excesivamente corporativo o académico.
- Priorizar párrafos cohesionados. No convertir cada idea en una lista.
- Usar listas solo cuando aporten claridad real: campos de formulario, reglas cerradas, pasos de reproducción, escenarios o varios puntos funcionales independientes.
- No añadir secciones de plantilla por defecto. Una tarea pequeña puede ser un único párrafo. Una tarea compleja puede necesitar contexto, alcance, ejemplo o resultado esperado.
- No inventar datos, reglas, nombres de campos, estados, métricas o decisiones técnicas. Si una ambigüedad impide redactar correctamente, preguntar. Si no impide avanzar, conservarla como punto abierto.
- No repetir la misma idea en introducción, alcance, detalle y conclusión.
- No explicar al usuario cómo se ha redactado el ticket salvo que lo pida.

## Elegir el formato

### Título + descripción

Cuando el usuario pida una tarea completa, devolver:

**Título:** [título]

**Descripción:**

[texto]

El título debe ser corto, descriptivo y orientado a la acción. Preferir verbos como:
- `Revisar` cuando todavía hay que investigar la causa.
- `Corregir` cuando el error y el cambio esperado están claros.
- `Añadir`, `Permitir`, `Incorporar`, `Exponer`, `Homogeneizar`, `Adaptar` o `Implementar` para nuevas capacidades.
- `Analizar` para spikes o tareas cuyo objetivo es proponer una solución, no implementarla.

Evitar títulos genéricos como "Mejora sistema" o "Cambios frontend".

### Solo descripción

Si el usuario ya proporciona el título o pide únicamente la descripción, no inventar otro título salvo que ayude claramente y el usuario lo haya pedido.

### Registro de trabajo

Redactar como resumen de lo ya realizado. No convertirlo en una nueva especificación ni enumerar pendientes salvo que el usuario los pida expresamente.

Preferir fórmulas como:
- `Se implementa...`
- `Se corrige...`
- `Se adapta...`
- `Se incorpora...`
- `Se revisa...`

Incluir el motivo o efecto del cambio cuando sea relevante. Agrupar varios cambios relacionados en pocos párrafos. Evitar detalles internos sin valor para el registro, pero conservar nombres técnicos importantes cuando explican el trabajo realizado.

## Ajustar el nivel de detalle

Inferir el tamaño por el contexto:

- **Subtarea pequeña / ajuste visual:** 1 párrafo o 2 como máximo.
- **Bug:** contexto breve + comportamiento actual + comportamiento esperado. Usar pasos de reproducción solo si ayudan.
- **Mejora funcional:** explicar objetivo, comportamiento esperado y restricciones principales.
- **Tarea técnica:** añadir nombres de propiedades, servicios, contratos o ejemplos solo si han sido proporcionados y son útiles para ejecutar el trabajo.
- **Tarea de análisis:** definir claramente el problema, el objetivo del análisis, condicionantes conocidos y qué propuesta se espera. No cerrar la solución técnica salvo que el usuario ya la haya decidido.
- **Registro de trabajo:** centrarse en lo completado y su resultado.

## Criterios de redacción

### Explicar primero el porqué cuando aporte contexto

Una buena descripción suele comenzar con la necesidad de negocio o el problema real y después indicar el cambio requerido.

Ejemplo de enfoque:

> Con el objetivo de facilitar la gestión de grandes volúmenes de registros, se requiere permitir al usuario seleccionar qué grupos desea visualizar en los resultados de conciliación...

No añadir un "objetivo" artificial si la tarea es trivial.

### Distinguir hechos de hipótesis

Si el usuario dice "entiendo que puede ser X", conservarlo como hipótesis:

> Todo apunta a que el origen de la incidencia se encuentra en Amadeus.

No convertirlo en certeza.

### Mantener compatibilidad y excepciones explícitas

Cuando el usuario indique que el comportamiento actual debe mantenerse en ciertos casos, reflejarlo de forma visible y breve.

Ejemplo:

> Si el `accountCode` no comienza por `PRE_`, se mantendrá el tratamiento actual.

### Evitar tecnicismo innecesario en tareas funcionales

No introducir arquitectura, clases, patrones o soluciones de implementación si el usuario está describiendo una necesidad funcional. En cambio, si proporciona un nombre de propiedad o contrato relevante (`businessTags`, `OrderViewRS`, etc.), mantenerlo.

## Convenciones específicas observadas

- Usar `V1` y `V2` tal cual.
- Usar "disponibilidad", "cotización", "reserva", "oferta", "expediente", "agencia", "proveedor" y "localizador" con su significado funcional habitual.
- Para frontend, hablar de coherencia visual, filtros, componentes, `padding`, `drawer`, `modal`, `action-list`, etc. sin añadir framework salvo que se indique.
- Para seguridad, explicar el comportamiento esperado y el efecto sobre el usuario; no sobredimensionar el ticket con teoría de seguridad.
- Para tareas que dependen de otra, mencionar la dependencia solo si afecta al orden o al alcance.
- Para adjuntos o mockups, referirse a ellos como "mockup adjunto", "captura adjunta" o "caso adjunto" sin describir detalles no visibles o no proporcionados.

## Referencia de ejemplos

Consultar `references/examples.md` cuando sea necesario afinar el tono, tamaño o estructura para tickets y registros de trabajo.
