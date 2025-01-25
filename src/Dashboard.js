import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00ff00'];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('m');
  return `${year}-${month.padStart(2, '0')}`;
};

const convertGradDate = (gradDate) => {
  if (!gradDate) return '';
  const [month, year] = gradDate.split('-');
  const monthNum = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;
  return `20${year}m${monthNum}`;
};

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hash(password) === -1621563955) {
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">TCI Dashboard Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const CityChart = ({ data, city, selectedVars }) => {
  const impDate = data[0]?.impdate;
  const gradDate = data[0]?.graduationdate;

  return (
    <div className="mb-8 border rounded p-4">
      <h3 className="text-lg font-medium mb-2">{city}</h3>
      <div style={{ height: '400px' }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              interval={3}
              angle={90}
              dx={10}
              dy={20}
              height={70}
              tick={{
                fontSize: 10
              }}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={formatDate}
            />
            <Legend />
            <ReferenceLine 
              x={impDate} 
              stroke="red" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'imp date', 
                angle: 90,
                position: 'insideTopRight',
                fill: 'red',
                fontSize: 9,
                offset: 5,
                backgroundColor: 'white',
                padding: 2,
                dy: 50
              }} 
            />
            <ReferenceLine 
              x={convertGradDate(gradDate)} 
              stroke="blue" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'grad date', 
                angle: 90,
                position: 'insideTopRight',
                fill: 'blue',
                fontSize: 9,
                offset: 5,
                backgroundColor: 'white',
                padding: 2,
                dy: 50
              }} 
            />
            {selectedVars.nac_wraadj_total_imp && (
              <Line type="monotone" dataKey="nac_wraadj_total_imp" stroke={COLORS[0]} name="NAC Wrap Adj Total (Imp)" dot={false} />
            )}
            {selectedVars.totalreportingsdp_imp && (
              <Line type="monotone" dataKey="totalreportingsdp_imp" stroke={COLORS[1]} name="Total Reporting SDP (Imp)" dot={false} />
            )}
            {selectedVars.totalreportingsdp && (
              <Line type="monotone" dataKey="totalreportingsdp" stroke={COLORS[2]} name="Total Reporting SDP" dot={false} />
            )}
            {selectedVars.nac_wraadj_total && (
              <Line type="monotone" dataKey="nac_wraadj_total" stroke={COLORS[3]} name="NAC Wrap Adj Total" dot={false} />
            )}
            {selectedVars.nac_alladj_total_imp && (
              <Line type="monotone" dataKey="nac_alladj_total_imp" stroke={COLORS[4]} name="NAC All Adj Total (Imp)" dot={false} />
            )}
            {selectedVars.nac_alladj_total && (
              <Line type="monotone" dataKey="nac_alladj_total" stroke={COLORS[5]} name="NAC All Adj Total" dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DashboardContent = ({ onLogout }) => {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedVars, setSelectedVars] = useState({
    nac_wraadj_total_imp: true,
    totalreportingsdp_imp: true,
    totalreportingsdp: true,
    nac_wraadj_total: true,
    nac_alladj_total_imp: true,
    nac_alladj_total: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const SHEET_ID = '1lcU9KEq9jpON6d1-5ojDgDMcdLmcKrUVPG1GQENb2bk';
        const SHEET_GID = '795805122';
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const result = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        setData(result.data);
        const uniqueCountries = _.uniq(result.data.map(row => row.country)).sort();
        setCountries(uniqueCountries);
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryCities = _.uniq(
        data
          .filter(row => row.country === selectedCountry)
          .map(row => row.city)
      ).sort();
      setCities(countryCities);
      setSelectedCities([]);
    }
  }, [selectedCountry, data]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleVarChange = (variable) => {
    setSelectedVars(prev => ({
      ...prev,
      [variable]: !prev[variable]
    }));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard - TCI</h1>
        <button 
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Country:</label>
          <select 
            value={selectedCountry} 
            onChange={handleCountryChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a country...</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Variables:</label>
          <div className="space-y-2">
            {Object.keys(selectedVars).map((variable, idx) => (
              <label key={variable} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVars[variable]}
                  onChange={() => handleVarChange(variable)}
                  className="mr-2"
                />
                <span style={{ color: COLORS[idx] }}>{variable}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {selectedCountry && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Select Cities:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <label className="flex items-center font-medium">
              <input
                type="checkbox"
                checked={selectedCities.length === cities.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCities(cities);
                  } else {
                    setSelectedCities([]);
                  }
                }}
                className="mr-2"
              />
              Select All
            </label>
            {cities.map(city => (
              <label key={city} className="flex items-center">
                <input
                  type="checkbox"
                  value={city}
                  checked={selectedCities.includes(city)}
                  onChange={handleCityChange}
                  className="mr-2"
                />
                {city}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {selectedCities.map(city => {
          const cityData = data
            .filter(row => row.city === city)
            .map(row => ({
              date: row.reportingdate,
              ...row
            }));

          return (
            <CityChart 
              key={city}
              data={cityData}
              city={city}
              selectedVars={selectedVars}
            />
          );
        })}
      </div>

      {selectedCountry && selectedCities.length === 0 && (
        <p>Please select one or more cities</p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <DashboardContent onLogout={() => setIsLoggedIn(false)} />;
};

export default Dashboard;