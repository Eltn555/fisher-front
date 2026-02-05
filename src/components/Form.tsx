import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { TelegramWebApp } from '../types/telegram'
import './Form.css'

const typeLabels: Record<string, string> = {
  'c': 'Температура воды (°C)',
  'kg': 'Выдано корма (кг)',
  'tara': 'Кислород в воде (мг/л)',
  'kgs': 'Вес рыбы (кг)',
  'saturation': 'Сатурация воды (%)',
  'pH': 'pH воды'
}

interface KgsInput {
  id: number
  value: string
}

function Form() {
  const navigate = useNavigate()
  const [tg, setTg] = useState<TelegramWebApp | null>(null)
  const [username, setUsername] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [value, setValue] = useState('')
  const [kgsInputs, setKgsInputs] = useState<KgsInput[]>([{ id: 1, value: '' }])
  const [locations, setLocations] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      webApp.ready()
      webApp.expand()
      setTg(webApp)
      
      const user = webApp.initDataUnsafe.user
      if (user) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
        setUsername(fullName)
      }
    }
  }, [])

  useEffect(() => {
    if (tg) {
      loadLocations()
      checkAdminStatus()
    }
  }, [tg])

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }, [])

  const loadLocations = async () => {
    try {
      const result = await api.getLocations()
      
      if (result.success && result.locations && result.locations.length > 0) {
        setLocations(result.locations)
      }
    } catch (error) {
      console.error('Failed to load locations:', error)
    }
  }

  const checkAdminStatus = async () => {
    if (!tg) return
    
    try {
      const user = await api.getUser()
      if (user && user.role === 'ADMIN') {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
    }
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    setValue('')
    if (newType !== 'kgs') {
      setKgsInputs([{ id: 1, value: '' }])
    }
  }

  const updateKgsInput = (id: number, value: string) => {
    setKgsInputs(prev => {
      const updated = prev.map(input => 
        input.id === id ? { ...input, value } : input
      )
      
      // If all inputs have values, add a new empty one
      const allHaveValues = updated.every(inp => inp.value.trim() !== '')
      if (allHaveValues && updated[updated.length - 1].value.trim() !== '') {
        const newId = Math.max(...updated.map(i => i.id), 0) + 1
        return [...updated, { id: newId, value: '' }]
      }
      
      return updated
    })
  }

  const removeKgsInput = (id: number) => {
    if (kgsInputs.length > 1) {
      setKgsInputs(prev => prev.filter(input => input.id !== id))
    } else {
      // Clear the value instead of removing
      setKgsInputs([{ id: 1, value: '' }])
    }
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !type || !location) {
      showMessage('❌ Пожалуйста, заполните все обязательные поля', 'error')
      return
    }

    let finalValue: string

    if (type === 'kgs') {
      const kgsValues = kgsInputs
        .map(input => {
          let val = input.value.trim()
          val = val.replace(',', '.')
          return val
        })
        .filter(val => val !== '')
      
      if (kgsValues.length === 0) {
        showMessage('❌ Пожалуйста, введите хотя бы одно значение веса рыбы', 'error')
        return
      }
      
      for (const val of kgsValues) {
        if (isNaN(parseFloat(val))) {
          showMessage('❌ Пожалуйста, введите корректные числа', 'error')
          return
        }
      }
      
      finalValue = kgsValues.join(', ')
    } else {
      if (!value || value.trim() === '') {
        showMessage('❌ Пожалуйста, введите значение', 'error')
        return
      }
      const normalizedValue = value.replace(',', '.')
      if (isNaN(parseFloat(normalizedValue))) {
        showMessage('❌ Пожалуйста, введите корректное число', 'error')
        return
      }
      finalValue = normalizedValue
    }

    if (!tg) return

    setIsSubmitting(true)

    try {
      const data = {
        date,
        location,
        type,
        value: finalValue,
      }

      const result = await api.submitForm(data)

      if (result.success) {
        showMessage(result.message, 'success')
        // Reset form
        setDate(new Date().toISOString().split('T')[0])
        setType('')
        setLocation('')
        setValue('')
        setKgsInputs([{ id: 1, value: '' }])
      } else {
        showMessage(result.error || 'Ошибка отправки формы', 'error')
      }
    } catch (error) {
      showMessage('Ошибка сети. Пожалуйста, попробуйте снова.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getValueLabel = () => {
    return typeLabels[type] || 'Значение'
  }

  const getValuePlaceholder = () => {
    if (type === 'c') {
      return '(например: 24 или 24,5)'
    } else if (type === 'kg') {
      return '(например: 10 или 10,5)'
    }
    return ''
  }

  return (
    <div className="container">
      {isAdmin && (
        <div className="userManagement-btn">
          <button onClick={() => navigate('/userManagement')}>
            Управление пользователями
          </button>
        </div>
      )}
      
      <h1>Форма отправки данных</h1>
      <p className="username-text">
        Здравствуйте, <b>{username}</b>, заполните форму ниже, чтобы отправить данные в систему.
      </p>
      
      <form id="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Дата</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Тип данных</label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            required
          >
            <option value="">Выберите тип данных...</option>
            <option value="c">Температура воды</option>
            <option value="kg">Выдано корма (кг)</option>
            <option value="tara">Кислород в воде (мг/л)</option>
            <option value="kgs">Вес рыбы (кг)</option>
            <option value="saturation">Сатурация воды (%)</option>
            <option value="pH">pH воды</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Выберите пруд</label>
          <select
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option value="">{locations.length > 0 ? 'Выберите пруд...' : 'Загрузка прудов...'}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" id="value-group">
          <label htmlFor="value" id="value-label">{getValueLabel()}</label>
          
          {type === 'kgs' ? (
            <div id="kgs-values-container" className="kgs-values-container">
              {kgsInputs.map((input) => (
                <div key={input.id} className="value-input-group">
                  <input
                    type="text"
                    className="kgs-input"
                    inputMode="decimal"
                    pattern="[0-9]+([.,][0-9]+)?"
                    placeholder="Вес рыбы (5 или 5.2)кг"
                    value={input.value}
                    onChange={(e) => updateKgsInput(input.id, e.target.value)}
                    onBlur={(e) => {
                      if (kgsInputs.length > 1 && !e.target.value.trim()) {
                        removeKgsInput(input.id)
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeKgsInput(input.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div id="single-value-container">
              <input
                type="text"
                id="value"
                name="value"
                inputMode="decimal"
                pattern="[0-9]+([.,][0-9]+)?"
                placeholder={getValuePlaceholder()}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required={type !== ''}
              />
            </div>
          )}
        </div>

        <button type="submit" id="submitBtn" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.type} show`}>
          {message.text}
        </div>
      )}
    </div>
  )
}

export default Form
