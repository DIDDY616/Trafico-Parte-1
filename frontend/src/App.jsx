import { useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend} 
from 'chart.js';

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,TooltipLegend);

export default function App() {
  let [location, setLocation] = useState("");
  let [cars, setCars] = useState([]);
  let [simSpeed, setSimSpeed] = useState(10);
  let [velocityData, setVelocityData] = useState([]);
  let [stepCount, setStepCount] = useState(0);
  const running = useRef(null);

  let setup = () => {
    console.log("Hola");
    setVelocityData([]);
    setStepCount(0);
    
    fetch("http://localhost:8000/simulations", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  })
    }).then(resp => resp.json())
    .then(data => {
      console.log(data);
      setLocation(data["Location"]);
      setCars(data["cars"]);
      
      const blueCar = data["cars"].find(car => car.id === 1);
      if (blueCar) {
        setVelocityData([blueCar.vel[0]]);
      }
    });
  }

  const handleStart = () => {
    running.current = setInterval(() => {
      fetch("http://localhost:8000" + location)
      .then(res => res.json())
      .then(data => {
        setCars(data["cars"]);
        
        const blueCar = data["cars"].find(car => car.id === 1);
        if (blueCar) {
          setStepCount(prev => prev + 1);
          setVelocityData(prevData => {
            const newData = [...prevData, blueCar.vel[0]];
            return newData.slice(-100);
          });
        }
      });
    }, 1000 / simSpeed);
  };

  const handleStop = () => {
    clearInterval(running.current);
  }

  const chartData = {
    labels: velocityData.map((_, index) => stepCount - velocityData.length + index + 1),
    datasets: [
      {data: velocityData,borderColor: 'rgb(33, 150, 243)',backgroundColor: 'rgba(33, 150, 243, 0.1)',tension: 0.1,borderWidth: 2,}
    ]
  };

  const chartOptions = {responsive: true,maintainAspectRatio: false,animation: false,plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1.2,
        title: {
          display: true,
          text: 'Velocidad'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Pasos'
        }
      }
    }
  };

  return (
    <div>
      <div>
        <button onClick={setup}>Setup</button>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
      </div>
      
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg" style={{backgroundColor:"white"}}>
        <rect x={0} y={200} width={800} height={80} style={{fill: "darkgray"}}></rect>
        {
          cars.map(car =>
            <image key={car.id} id={car.id} x={car.pos[0]*32} y={car.pos[1]*32} width={32}  href={car.id === 1 ? "./dark-racing-car.png" : "./racing-car.png"}/>
          )
        }
      </svg>

      <div style={{ marginTop: '30px', height: '300px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

    
    </div>
  );
}