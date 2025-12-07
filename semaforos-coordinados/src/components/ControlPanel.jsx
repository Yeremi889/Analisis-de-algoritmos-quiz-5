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
          <h4>⏱️ Tiempos del Sistema (segundos):</h4>
          
          <div className="control-tiempo">
            <label>🟢 Verde:</label>
            <input 
              type="range" 
              min="3" 
              max="15" 
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
              min="1" 
              max="3" 
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
            <span className="etiqueta">🟢 Estado:</span>
            <span className={`valor ${sistemaActivo ? 'sistema-activo' : 'sistema-inactivo'}`}>
              {sistemaActivo ? 'ACTIVO' : 'PAUSADO'}
            </span>
          </div>
          
          <div className="estado-item">
            <span className="etiqueta">🚦 Fase:</span>
            <span className="valor">{faseActual + 1} de 8</span>
          </div>
          
          <div className="estado-item">
            <span className="etiqueta">⏱️ Tiempo:</span>
            <span className="valor">{tiempoRestante}s</span>
          </div>
          
          <div className="estado-item">
            <span className="etiqueta">🔄 Ciclo:</span>
            <span className="valor">{(tiempos.verde + tiempos.amarillo) * 4}s</span>
          </div>
          
          <hr className="divisor" />
          
          <div className="rotacion-info">
            <p className="titulo-rotacion">📍 Orden de Rotación:</p>
            <div className="orden-fases">
              <div className={`fase-item ${faseActual === 0 || faseActual === 1 ? 'activo' : ''}`}>NORTE</div>
              <span className="flecha">→</span>
              <div className={`fase-item ${faseActual === 2 || faseActual === 3 ? 'activo' : ''}`}>ESTE</div>
              <span className="flecha">→</span>
              <div className={`fase-item ${faseActual === 4 || faseActual === 5 ? 'activo' : ''}`}>SUR</div>
              <span className="flecha">→</span>
              <div className={`fase-item ${faseActual === 6 || faseActual === 7 ? 'activo' : ''}`}>OESTE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;