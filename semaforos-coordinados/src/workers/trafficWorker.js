let currentState = 'rojo';
let currentTimeout = null;

self.onmessage = (event) => {
  const { type, state, duration } = event.data;

  if (currentTimeout !== null) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }

  if (type === 'start') {
    currentState = state;
    
    self.postMessage({
      type: 'stateChange',
      state: currentState,
      timestamp: Date.now()
    });

    if (duration > 0) {
      currentTimeout = setTimeout(() => {
        self.postMessage({
          type: 'phaseDone',
          timestamp: Date.now()
        });
      }, duration);
    }
  }

  if (type === 'stop') {
    if (currentTimeout !== null) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    currentState = 'rojo';
  }
};