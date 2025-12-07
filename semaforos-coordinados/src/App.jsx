import { useState, useEffect, useRef } from 'react';
import Intersection from './components/Intersection';
import './App.css';

/**
 * ARQUITECTURA CON COMPUTACIÓN PARALELA:
 * 
 * - 4 Web Workers independientes (norte, este, sur, oeste)
 * - Controlador central en el thread principal que coordina
 * - Comunicación asincrónica via postMessage/onmessage
 * - Garantiza sincronización: solo 1 semáforo en verde a la vez
 */

function App() {
  // Estados
  const [estadoSemaforos, setEstadoSemaforos] = useState({
    norte: 'rojo',
    sur: 'rojo',
    este: 'verde',
    oeste: 'rojo'
  });

  const [tiempos, setTiempos] = useState({
    verde: 10,
    amarillo: 3
  });

  const [sistemaActivo, setSistemaActivo] = useState(true);
  const [faseActual, setFaseActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(10);
  
  // Referencias para los Web Workers
  const workersRef = useRef({});
  const timerRef = useRef(null);

  // Secuencia de fases - Orden: NORTE -> ESTE -> SUR -> OESTE (Solo 1 verde a la vez)
  const fases = [
    // Fase 0: NORTE verde, otros rojo
    { norte: 'verde', sur: 'rojo', este: 'rojo', oeste: 'rojo' },
    // Fase 1: NORTE amarillo, ESTE amarillo (preparando cambio)
    { norte: 'amarillo', sur: 'rojo', este: 'amarillo', oeste: 'rojo' },
    // Fase 2: ESTE verde, otros rojo
    { norte: 'rojo', sur: 'rojo', este: 'verde', oeste: 'rojo' },
    // Fase 3: ESTE amarillo, SUR amarillo (preparando cambio)
    { norte: 'rojo', sur: 'amarillo', este: 'amarillo', oeste: 'rojo' },
    // Fase 4: SUR verde, otros rojo
    { norte: 'rojo', sur: 'verde', este: 'rojo', oeste: 'rojo' },
    // Fase 5: SUR amarillo, OESTE amarillo (preparando cambio)
    { norte: 'rojo', sur: 'amarillo', este: 'rojo', oeste: 'amarillo' },
    // Fase 6: OESTE verde, otros rojo
    { norte: 'rojo', sur: 'rojo', este: 'rojo', oeste: 'verde' },
    // Fase 7: OESTE amarillo, NORTE amarillo (preparando cambio)
    { norte: 'amarillo', sur: 'rojo', este: 'rojo', oeste: 'amarillo' }
  ];

  // Inicializar Web Workers - cada uno manejará un semáforo independientemente
  useEffect(() => {
    const directions = ['norte', 'este', 'sur', 'oeste'];
    
    // Crear un Worker por dirección
    directions.forEach((dir) => {
      const workerUrl = new URL('./workers/trafficWorker.js', import.meta.url);
      const worker = new Worker(workerUrl, { type: 'module' });
      
      // Manejador de mensajes del worker
      worker.onmessage = (event) => {
        const { type, state } = event.data;
        
        if (type === 'stateChange') {
          // Actualizar estado del semáforo desde el worker
          setEstadoSemaforos(prev => ({
            ...prev,
            [dir]: state
          }));
        }
        
        if (type === 'phaseDone') {
          // El worker señala que su fase terminó
          // (se usa para coordinación si es necesario)
        }
      };
      
      workersRef.current[dir] = worker;
    });

    return () => {
      // Limpiar workers al desmontar
      directions.forEach((dir) => {
        if (workersRef.current[dir]) {
          workersRef.current[dir].terminate();
        }
      });
    };
  }, []);

  // Controlador central que coordina las fases y comunica via Workers
  useEffect(() => {
    if (!sistemaActivo) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const ejecutarFase = (indiceFase) => {
      const fase = fases[indiceFase];
      setEstadoSemaforos(fase);
      setFaseActual(indiceFase);
      
      // Determinar duración según tipo de fase
      // Fases pares (0, 2, 4, 6): Verde - duración completa
      // Fases impares (1, 3, 5, 7): Amarillo - duración corta
      let duracionFase;
      if (indiceFase % 2 === 0) {
        duracionFase = tiempos.verde;
      } else {
        duracionFase = tiempos.amarillo;
      }
      
      // Enviar comandos a cada Worker para que ejecute su estado
      const directions = ['norte', 'este', 'sur', 'oeste'];
      directions.forEach((dir) => {
        const worker = workersRef.current[dir];
        if (worker) {
          worker.postMessage({
            type: 'start',
            state: fase[dir],
            duration: duracionFase * 1000
          });
        }
      });
      
      // Contador regresivo visual
      let contador = duracionFase;
      setTiempoRestante(contador);
      
      const intervalo = setInterval(() => {
        contador--;
        setTiempoRestante(contador);
        
        if (contador <= 0) {
          clearInterval(intervalo);
        }
      }, 1000);
      
      // Programar siguiente fase
      timerRef.current = setTimeout(() => {
        const siguienteFase = (indiceFase + 1) % fases.length;
        ejecutarFase(siguienteFase);
      }, duracionFase * 1000);
    };

    ejecutarFase(faseActual);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [sistemaActivo, tiempos, faseActual]);

  // Manejar cambios simples de velocidad (reduce o aumenta duraciones)
  const aumentarVelocidad = () => {
    setTiempos(prev => ({
      verde: Math.max(1, prev.verde - 1),
      amarillo: Math.max(1, prev.amarillo - 1),
      rojo: prev.rojo
    }));
  };

  const disminuirVelocidad = () => {
    setTiempos(prev => ({
      verde: Math.min(30, prev.verde + 1),
      amarillo: Math.min(10, prev.amarillo + 1),
      rojo: prev.rojo
    }));
  };

  return (
    <div className="app">
      <div className="speed-control" role="region" aria-label="Control de velocidad">
        <button className="speed-btn" onClick={aumentarVelocidad}>⏩</button>
        <div className="speed-label">Vel: {tiempos.verde}s / {tiempos.amarillo}s</div>
        <button className="speed-btn" onClick={disminuirVelocidad}>⏪</button>
      </div>

      <main className="main-content">
        <Intersection
          estadoSemaforos={estadoSemaforos}
          faseActual={faseActual}
        />
      </main>
    </div>
  );
}

export default App;