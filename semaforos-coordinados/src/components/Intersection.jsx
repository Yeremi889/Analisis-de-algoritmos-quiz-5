import React from 'react';
import TrafficLight from './TrafficLight';
import './Intersection.css';

const Intersection = ({ estadoSemaforos, faseActual }) => {
  // Información de la fase actual
  const getInfoFase = () => {
    const fases = [
      { desc: "🚗 Este-Oeste: VERDE | Norte-Sur: ROJO", activo: "este-oeste" },
      { desc: "⚠ Este-Oeste: AMARILLO | Norte-Sur: ROJO", activo: "este-oeste-amarillo" },
      { desc: "🚗 Norte-Sur: VERDE | Este-Oeste: ROJO", activo: "norte-sur" },
      { desc: "⚠ Norte-Sur: AMARILLO | Este-Oeste: ROJO", activo: "norte-sur-amarillo" },
    ];
    return fases[faseActual] || fases[0];
  };

  const infoFase = getInfoFase();

  return (
    <div className="interseccion-container">
      <div className="interseccion">
        {/* Calles */}
        <div className="calle horizontal"></div>
        <div className="calle vertical"></div>
        
        {/* Semáforos */}
        <div className="posicion-semaforo norte">
          <TrafficLight 
            direccion="norte" 
            estado={estadoSemaforos.norte}
            tamaño="pequeño"
          />
        </div>
        
        <div className="posicion-semaforo sur">
          <TrafficLight 
            direccion="sur" 
            estado={estadoSemaforos.sur}
            tamaño="pequeño"
          />
        </div>
        
        <div className="posicion-semaforo este">
          <TrafficLight 
            direccion="este" 
            estado={estadoSemaforos.este}
            tamaño="pequeño"
          />
        </div>
        
        <div className="posicion-semaforo oeste">
          <TrafficLight 
            direccion="oeste" 
            estado={estadoSemaforos.oeste}
            tamaño="pequeño"
          />
        </div>
        
        {/* Centro del cruce */}
        <div className="centro-interseccion">
          <div className="indicador-fase">
            <div className="fase-activa">{infoFase.activo}</div>
            <div className="descripcion-fase">{infoFase.desc}</div>
          </div>
        </div>
        
        {/* Vehículos animados */}
        <div className="vehiculo vehiculo-este"></div>
        <div className="vehiculo vehiculo-oeste"></div>
        <div className="vehiculo vehiculo-norte"></div>
        <div className="vehiculo vehiculo-sur"></div>
      </div>
    </div>
  );
};

export default Intersection;