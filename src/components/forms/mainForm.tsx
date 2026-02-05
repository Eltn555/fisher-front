import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'

interface MainFormProps {
  locations: string[]
  location?: string
  date?: string
}

function MainForm({ locations: initialLocations, location: initialLocation, date: initialDate }: MainFormProps) {
  const [locations, setLocations] = useState<string[]>(initialLocations || [])
  const [location, setLocation] = useState(initialLocation || '')
  const [oxygen, setOxygen] = useState('')
  const [temperature, setTemperature] = useState('')
  const [saturation, setSaturation] = useState('')
  const [pH, setPH] = useState('')
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation)
    }
  }, [initialLocation])

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  return (
    <form className="main-form">
      <div className="form-group">
        <label htmlFor="location">Пруд</label>
        <select
          id="location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">{locations.length > 0 ? 'Выберите пруд...' : 'Загрузка прудов...'}</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="oxygen">Кислород в воде (мг/л)</label>
        <input
          type="number"
          id="oxygen"
          name="oxygen"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={oxygen}
          onChange={(e) => setOxygen(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="temperature">Температура воды (°C)</label>
        <input
          type="number"
          id="temperature"
          name="temperature"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="saturation">Сатурация воды (%)</label>
        <input
          type="number"
          id="saturation"
          name="saturation"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={saturation}
          onChange={(e) => setSaturation(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pH">pH</label>
        <input
          type="number"
          id="pH"
          name="pH"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={pH}
          onChange={(e) => setPH(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Дата</label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </form>
  )
}

export default MainForm
