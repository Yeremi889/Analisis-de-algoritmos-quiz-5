// Este es el Worker que manejará la lógica de cada semáforo en paralelo
let intervalId = null;
let currentState = 'rojo';
let tiempoVerde = 10;
let tiempoAmarillo = 3;
let tiempoRojo = 2;

self.onmessage = function(e) {
  const { action, data } = e.data;
  
  switch(action) {
    case 'INICIAR':
      if (intervalId) clearInterval(intervalId);
      currentState = data.estadoInicial;
      tiempoVerde = data.tiempos.verde;
      tiempoAmarillo = data.tiempos.amarillo;
      tiempoRojo = data.tiempos.rojo;
      
      // Iniciar ciclo
      ejecutarCiclo();
      break;
      
    case 'DETENER':
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      break;
      
    case 'ACTUALIZAR_TIEMPOS':
      tiempoVerde = data.verde;
      tiempoAmarillo = data.amarillo;
      tiempoRojo = data.rojo;
      break;
      
    case 'CAMBIAR_ESTADO':
      currentState = data;
      self.postMessage({ type: 'ESTADO_CAMBIADO', estado: currentState });
      break;
  }
};

function ejecutarCiclo() {
  intervalId = setInterval(() => {
    // Lógica de cambio de estado
    let siguienteEstado;
    let tiempoEspera;
    
    switch(currentState) {
      case 'verde':
        siguienteEstado = 'amarillo';
        tiempoEspera = tiempoVerde * 1000;
        break;
      case 'amarillo':
        siguienteEstado = 'rojo';
        tiempoEspera = tiempoAmarillo * 1000;
        break;
      case 'rojo':
        siguienteEstado = 'verde';
        tiempoEspera = tiempoRojo * 1000;
        break;
      default:
        siguienteEstado = 'rojo';
        tiempoEspera = 1000;
    }
    
    // Esperar y cambiar estado
    setTimeout(() => {
      currentState = siguienteEstado;
      self.postMessage({ 
        type: 'ESTADO_CAMBIADO', 
        estado: currentState,
        timestamp: Date.now()
      });
    }, tiempoEspera);
    
  }, 100); // Revisar cada 100ms
}