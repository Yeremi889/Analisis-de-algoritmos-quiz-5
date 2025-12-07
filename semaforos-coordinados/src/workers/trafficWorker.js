/**
 * Web Worker independiente para gestionar un semáforo.
 * 
 * Cada worker maneja el ciclo de su semáforo de forma independiente
 * y responde a comandos del controlador central (App.jsx).
 * 
 * Protocolo de mensajes:
 * - Main -> Worker: { type: 'start', state: 'verde'|'amarillo'|'rojo', duration: ms }
 * - Worker -> Main: { type: 'stateChange', state: 'verde'|'amarillo'|'rojo', timestamp }
 * - Worker -> Main: { type: 'phaseDone', timestamp }
 */

let currentState = 'rojo';
let currentTimeout = null;

/**
 * Recibe comandos del controlador central para cambiar estado del semáforo.
 */
self.onmessage = (event) => {
  const { type, state, duration } = event.data;

  // Limpiar timeout previo si existe
  if (currentTimeout !== null) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }

  if (type === 'start') {
    // Cambiar estado inmediatamente
    currentState = state;
    
    // Notificar al main el cambio de estado
    self.postMessage({
      type: 'stateChange',
      state: currentState,
      timestamp: Date.now()
    });

    // Programar siguiente cambio si duration > 0
    if (duration > 0) {
      currentTimeout = setTimeout(() => {
        // Señal de que este estado terminó (usado para coordinación)
        self.postMessage({
          type: 'phaseDone',
          timestamp: Date.now()
        });
      }, duration);
    }
  }

  if (type === 'stop') {
    // Detener el worker (limpieza)
    if (currentTimeout !== null) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    currentState = 'rojo';
  }
};