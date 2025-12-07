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
    amarillo: 3,
    rojo: 2
  });

  const [sistemaActivo, setSistemaActivo] = useState(true);
  const [faseActual, setFaseActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(10);
  
  // Referencias para los Workers
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

  // Inicializar Workers - DESHABILITADO: Usando lógica central sincronizada
  useEffect(() => {
    // Los semáforos se controlan desde el controlador central
    // para garantizar sincronización perfecta
    return () => {
      // Limpiar si hay workers
      Object.values(workersRef.current).forEach(worker => {
        if (worker) worker.terminate();
      });
    };
  }, []);

  // Controlador central que coordina las fases
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
        // Fase con verde
        duracionFase = tiempos.verde;
      } else {
        // Fase de transición con amarillo
        duracionFase = tiempos.amarillo;
      }
      
      // Contador regresivo
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