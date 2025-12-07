import React from 'react';
import './TrafficLight.css';

const TrafficLight = ({ direccion, estado, tamaño = 'mediano' }) => {
  const getTamañoClase = () => {
    switch(tamaño) {
      case 'pequeño': return 'semaforo-pequeño';
      case 'mediano': return 'semaforo-mediano';
      case 'grande': return 'semaforo-grande';
      default: return 'semaforo-mediano';
    }
  };

  return (
    <div className={`semaforo ${getTamañoClase()} ${direccion}`}>
      <div className="caja-semaforo">
        <div className={`luz rojo ${estado === 'rojo' ? 'activa' : ''}`}></div>
        <div className={`luz amarillo ${estado === 'amarillo' ? 'activa' : ''}`}></div>
        <div className={`luz verde ${estado === 'verde' ? 'activa' : ''}`}></div>
      </div>
    </div>
  );
};

export default TrafficLight;