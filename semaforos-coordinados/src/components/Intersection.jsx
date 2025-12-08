import React, { useState, useEffect, useRef } from 'react';
import TrafficLight from './TrafficLight';
import './Intersection.css';

const Intersection = ({ estadoSemaforos, faseActual }) => {
  const [carsMoving, setCarsMoving] = useState({
    norte: false,
    sur: false,
    este: false,
    oeste: false
  });

  useEffect(() => {
    setCarsMoving({
      norte: estadoSemaforos.norte === 'verde',
      sur: estadoSemaforos.sur === 'verde',
      este: estadoSemaforos.este === 'verde',
      oeste: estadoSemaforos.oeste === 'verde'
    });
  }, [estadoSemaforos]);

  const getInfoFase = () => {
    const fases = [
      { desc: " NORTE: VERDE", activo: "Norte Activo", direccion: "NORTE" },
      { desc: " Transición: NORTE → ESTE", activo: "Transición...", direccion: "TRANSICIÓN" },
      { desc: " ESTE: VERDE", activo: "Este Activo", direccion: "ESTE" },
      { desc: " Transición: ESTE → SUR", activo: "Transición...", direccion: "TRANSICIÓN" },
      { desc: " SUR: VERDE", activo: "Sur Activo", direccion: "SUR" },
      { desc: " Transición: SUR → OESTE", activo: "Transición...", direccion: "TRANSICIÓN" },
      { desc: " OESTE: VERDE", activo: "Oeste Activo", direccion: "OESTE" },
      { desc: " Transición: OESTE → NORTE", activo: "Transición...", direccion: "TRANSICIÓN" },
    ];
    return fases[faseActual] || fases[0];
  };

  const infoFase = getInfoFase();

  const [posiciones, setPosiciones] = useState({
    norte: { left: 460, top: 12 },
    este: { left: 658, top: 461 },
    sur: { left: 215, top: 608 },
    oeste: { left: 9, top: 155 }
  });

  const updatePos = (dir, axis, value) => {
    setPosiciones(prev => ({
      ...prev,
      [dir]: { ...prev[dir], [axis]: Number(value) }
    }));
  };

  return (
    <div className="interseccion-container">
      <div className="interseccion">
        <div className="calle horizontal"></div>
        <div className="calle vertical"></div>
        
        <div className="posicion-semaforo norte" style={{ left: posiciones.norte.left + 'px', top: posiciones.norte.top + 'px' }}>
          <TrafficLight 
            direccion="norte" 
            estado={estadoSemaforos.norte}
            tamaño="pequeño"
          />
        </div>
        
        <div className="posicion-semaforo sur" style={{ left: posiciones.sur.left + 'px', top: posiciones.sur.top + 'px' }}>
          <TrafficLight 
            direccion="sur" 
            estado={estadoSemaforos.sur}
            tamaño="pequeño"
          />
        </div>
        
        <div className="posicion-semaforo este" style={{ left: posiciones.este.left + 'px', top: posiciones.este.top + 'px' }}>
          <TrafficLight 
            direccion="este" 
            estado={estadoSemaforos.este}
            tamaño="pequeño"
          />
        </div>
        
        <div className="posicion-semaforo oeste" style={{ left: posiciones.oeste.left + 'px', top: posiciones.oeste.top + 'px' }}>
          <TrafficLight 
            direccion="oeste" 
            estado={estadoSemaforos.oeste}
            tamaño="pequeño"
          />
        </div>
        
        <div className="centro-interseccion"></div>
        
        {carsMoving.norte && (
          <div className="vehiculo vehiculo-norte vehiculo-unico"></div>
        )}
        
        {carsMoving.este && (
          <div className="vehiculo vehiculo-este vehiculo-unico"></div>
        )}
        
        {carsMoving.sur && (
          <div className="vehiculo vehiculo-sur vehiculo-unico"></div>
        )}
        
        {carsMoving.oeste && (
          <div className="vehiculo vehiculo-oeste vehiculo-unico"></div>
        )}
      </div>
    </div>
  );
};

export default Intersection;