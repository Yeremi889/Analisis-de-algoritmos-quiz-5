import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ 
  sistemaActivo, 
  onToggle, 
  tiempos, 
  onCambiarTiempo,
  faseActual,
  tiempoRestante 
}) => {
  return (
    <div className="panel-control">
      <h3>⚙️ Panel de Control</h3>
      
      <div className="controles">
        {/* Botón principal */}
        <button 
          className={`boton-control ${sistemaActivo ? 'activo' : 'inactivo'}`}
          onClick={onToggle}
        >
          {sistemaActivo ? '⏸️ PAUSAR' : '▶️ INICIAR'}
        </button>
        
        {/* Configuración de tiempos */}
        <div className="config-tiempos">
          <h4>Tiempos de Semáforo (segundos):</h4>
          
          <div className="control-tiempo">
            <label>🟢 Verde:</label>
            <input 
              type="range" 
              min="5" 
              max="20" 
              value={tiempos.verde}
              onChange={(e) => onCambiarTiempo('verde', e.target.value)}
              disabled={!sistemaActivo}
            />
            <span className="valor-tiempo">{tiempos.verde}s</span>
          </div>
          
          <div className="control-tiempo">
            <label>🟡 Amarillo:</label>
            <input 
              type="range" 
              min="2" 
              max="5" 
              value={tiempos.amarillo}
              onChange={(e) => onCambiarTiempo('amarillo', e.target.value)}
              disabled={!sistemaActivo}
            />
            <span className="valor-tiempo">{tiempos.amarillo}s</span>
          </div>
          
          <div className="control-tiempo">
            <label>🔴 Rojo:</label>
            <input 
              type="range" 
              min="2" 
              max="10" 
              value={tiempos.rojo}
              onChange={(e) => onCambiarTiempo('rojo', e.target.value)}
              disabled={!sistemaActivo}
            />
            <span className="valor-tiempo">{tiempos.rojo}s</span>
          </div>
        </div>
        
        {/* Información del sistema */}
        <div className="info-sistema">
          <div className="estado-item">
            <span className="etiqueta">Estado:</span>
            <span className={`valor ${sistemaActivo ? 'sistema-activo' : 'sistema-inactivo'}`}>
              {sistemaActivo ? '🟢 ACTIVO' : '⏸️ PAUSADO'}
            </span>
          </div>
          
          <div className="estado-item">
            <span className="etiqueta">Fase Actual:</span>
            <span className="valor">Fase {faseActual + 1}</span>
          </div>
          
          <div className="estado-item">
            <span className="etiqueta">Tiempo Restante:</span>
            <span className="valor">{tiempoRestante}s</span>
          </div>
          
          <div className="estado-item">
            <span className="etiqueta">Ciclo Completo:</span>
            <span className="valor">{tiempos.verde + tiempos.amarillo + tiempos.rojo}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;