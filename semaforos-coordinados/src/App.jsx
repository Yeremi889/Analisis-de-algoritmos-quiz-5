import { useState, useEffect, useRef } from 'react';
import Intersection from './components/Intersection';
import './App.css';

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

  // Secuencia de fases
  const fases = [
    { norte: 'verde', sur: 'rojo', este: 'rojo', oeste: 'rojo' },
    { norte: 'amarillo', sur: 'rojo', este: 'amarillo', oeste: 'rojo' },
    { norte: 'rojo', sur: 'rojo', este: 'verde', oeste: 'rojo' },
    { norte: 'rojo', sur: 'amarillo', este: 'amarillo', oeste: 'rojo' },
    { norte: 'rojo', sur: 'verde', este: 'rojo', oeste: 'rojo' },
    { norte: 'rojo', sur: 'amarillo', este: 'rojo', oeste: 'amarillo' },
    { norte: 'rojo', sur: 'rojo', este: 'rojo', oeste: 'verde' },
    { norte: 'amarillo', sur: 'rojo', este: 'rojo', oeste: 'amarillo' }
  ];

  useEffect(() => {
    const directions = ['norte', 'este', 'sur', 'oeste'];
    
    directions.forEach((dir) => {
      const workerUrl = new URL('./workers/trafficWorker.js', import.meta.url);
      const worker = new Worker(workerUrl, { type: 'module' });
      
      worker.onmessage = (event) => {
        const { type, state } = event.data;
        
        if (type === 'stateChange') {
          setEstadoSemaforos(prev => ({
            ...prev,
            [dir]: state
          }));
        }
        
        if (type === 'phaseDone') {
        }
      };
      
      workersRef.current[dir] = worker;
    });

    return () => {
      directions.forEach((dir) => {
        if (workersRef.current[dir]) {
          workersRef.current[dir].terminate();
        }
      });
    };
  }, []);

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
      
      let duracionFase;
      if (indiceFase % 2 === 0) {
        duracionFase = tiempos.verde;
      } else {
        duracionFase = tiempos.amarillo;
      }
      
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
      
      let contador = duracionFase;
      setTiempoRestante(contador);
      
      const intervalo = setInterval(() => {
        contador--;
        setTiempoRestante(contador);
        
        if (contador <= 0) {
          clearInterval(intervalo);
        }
      }, 1000);
      
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

  // Manejar cambios  de velocidad 
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
        <button className="speed-btn" onClick={aumentarVelocidad}>+</button>
        <div className="speed-label">Vel: {tiempos.verde}s / {tiempos.amarillo}s</div>
        <button className="speed-btn" onClick={disminuirVelocidad}>-</button>
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