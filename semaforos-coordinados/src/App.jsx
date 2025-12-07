import { useState, useEffect, useRef } from 'react';
import Intersection from './components/Intersection';
import ControlPanel from './components/ControlPanel';
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

  // Secuencia de fases
  const fases = [
    // Fase 1: Este-Oeste verde, Norte-Sur rojo
    { norte: 'rojo', sur: 'rojo', este: 'verde', oeste: 'verde' },
    // Fase 2: Este-Oeste amarillo, Norte-Sur rojo
    { norte: 'rojo', sur: 'rojo', este: 'amarillo', oeste: 'amarillo' },
    // Fase 3: Norte-Sur verde, Este-Oeste rojo
    { norte: 'verde', sur: 'verde', este: 'rojo', oeste: 'rojo' },
    // Fase 4: Norte-Sur amarillo, Este-Oeste rojo
    { norte: 'amarillo', sur: 'amarillo', este: 'rojo', oeste: 'rojo' }
  ];

  // Inicializar Workers
  useEffect(() => {
    // Crear Workers para cada dirección
    const direcciones = ['norte', 'sur', 'este', 'oeste'];
    
    direcciones.forEach(dir => {
      try {
        const worker = new Worker(new URL('./workers/trafficWorker.js', import.meta.url));
        workersRef.current[dir] = worker;
        
        worker.onmessage = (e) => {
          if (e.data.type === 'ESTADO_CAMBIADO') {
            setEstadoSemaforos(prev => ({
              ...prev,
              [dir]: e.data.estado
            }));
          }
        };
        
        // Iniciar worker
        worker.postMessage({
          action: 'INICIAR',
          data: {
            estadoInicial: estadoSemaforos[dir],
            tiempos: tiempos
          }
        });
      } catch (error) {
        console.error(`Error creando worker para ${dir}:`, error);
      }
    });

    return () => {
      // Limpiar Workers
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
      
      // Calcular duración de la fase
      const tieneVerde = Object.values(fase).includes('verde');
      const tieneAmarillo = Object.values(fase).includes('amarillo');
      
      let duracionFase;
      if (tieneVerde) duracionFase = tiempos.verde;
      else if (tieneAmarillo) duracionFase = tiempos.amarillo;
      else duracionFase = tiempos.rojo;
      
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

  // Manejar cambio de tiempos
  const handleCambiarTiempo = (color, valor) => {
    const nuevoValor = parseInt(valor);
    if (nuevoValor < 1) return;
    
    setTiempos(prev => ({
      ...prev,
      [color]: nuevoValor
    }));
    
    // Actualizar Workers
    Object.values(workersRef.current).forEach(worker => {
      if (worker) {
        worker.postMessage({
          action: 'ACTUALIZAR_TIEMPOS',
          data: {
            verde: color === 'verde' ? nuevoValor : tiempos.verde,
            amarillo: color === 'amarillo' ? nuevoValor : tiempos.amarillo,
            rojo: color === 'rojo' ? nuevoValor : tiempos.rojo
          }
        });
      }
    });
  };

  // Toggle sistema
  const toggleSistema = () => {
    const nuevoEstado = !sistemaActivo;
    setSistemaActivo(nuevoEstado);
    
    Object.values(workersRef.current).forEach(worker => {
      if (worker) {
        worker.postMessage({
          action: nuevoEstado ? 'INICIAR' : 'DETENER',
          data: nuevoEstado ? {
            estadoInicial: estadoSemaforos,
            tiempos: tiempos
          } : null
        });
      }
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚦 Sistema de Semáforos Coordinados</h1>
        <p className="subtitulo">Programación Paralela con Web Workers</p>
      </header>

      <main className="main-content">
        {/* Visualización del cruce */}
        <div className="seccion-visualizacion">
          <h2>📊 Vista del Cruce</h2>
          <Intersection 
            estadoSemaforos={estadoSemaforos}
            faseActual={faseActual}
          />
        </div>

        {/* Panel de control */}
        <div className="seccion-control">
          <ControlPanel
            sistemaActivo={sistemaActivo}
            onToggle={toggleSistema}
            tiempos={tiempos}
            onCambiarTiempo={handleCambiarTiempo}
            faseActual={faseActual}
            tiempoRestante={tiempoRestante}
          />
        </div>

        {/* Información técnica */}
        <div className="info-tecnica">
          <h3>🔧 Características Implementadas</h3>
          <div className="caracteristicas-grid">
            <div className="caracteristica">
              <div className="icono">⚡</div>
              <h4>Programación Paralela</h4>
              <p>Web Workers ejecutan cada semáforo en hilos separados</p>
            </div>
            <div className="caracteristica">
              <div className="icono">🎯</div>
              <h4>Coordinación Central</h4>
              <p>Controlador asegura que nunca haya dos verdes opuestos</p>
            </div>
            <div className="caracteristica">
              <div className="icono">🔄</div>
              <h4>Tiempo Real</h4>
              <p>Actualización dinámica con contador regresivo</p>
            </div>
            <div className="caracteristica">
              <div className="icono">🎨</div>
              <h4>Interfaz Visual</h4>
              <p>Representación gráfica del cruce con animaciones</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Sistema de Control de Tráfico - Computación Paralela</p>
        <p className="nota">Usando React Hooks, Web Workers y CSS Animations</p>
      </footer>
    </div>
  );
}

export default App;