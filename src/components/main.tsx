import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import './main.css'
import MainForm from './forms/mainForm'
import ControlCatchForm from './forms/controlCatchForm'
import SalesForm from './forms/salesForm'
import FishStockingForm from './forms/fishStockingForm'
import DeathReportForm from './forms/deathReportForm'

function Form() {
  const navigate = useNavigate()
  const [activeDate, setActiveDate] = useState('')
  const [activeLocation, setActiveLocation] = useState('')
  const [locations, setLocations] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0]
    setActiveDate(today)
    loadLocations()
    checkAdminStatus()
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
    try {
      const user = await api.getUser()
      if (user && user.role === 'ADMIN') {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
    }
  }

  return (
    <div className="max-w-[768px] mx-auto">      
      <Tabs defaultValue="Главное" className="bg-white rounded-xl mb-6 overflow-hidden">
        <TabsList className="grid grid-cols-1 md:grid-cols-5 bg-[#e8d5ff] items-center p-1 rounded-xl gap-1">
          <TabsTrigger
            value="Главное" 
            className="flex-1 px-2 py-2.5 bg-transparent border-none text-black text-sm font-medium cursor-pointer text-center rounded-lg transition-all whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-[#3390ec] data-[state=active]:text-white hover:opacity-70">
              Главное
          </TabsTrigger>
          <TabsTrigger
            value="Контрольный отлов"
            className="flex-1 px-2 py-2.5 bg-transparent border-none text-black text-sm font-medium cursor-pointer text-center rounded-lg transition-all whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-[#3390ec] data-[state=active]:text-white hover:opacity-70">
              Контрольный отлов
          </TabsTrigger>
          <TabsTrigger
            value="Продажа"
            className="flex-1 px-2 py-2.5 bg-transparent border-none text-black text-sm font-medium cursor-pointer text-center rounded-lg transition-all whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-[#3390ec] data-[state=active]:text-white hover:opacity-70">
              Продажа
          </TabsTrigger>
          <TabsTrigger
            value="Зарыбление"
            className="flex-1 px-2 py-2.5 bg-transparent border-none text-black text-sm font-medium cursor-pointer text-center rounded-lg transition-all whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-[#3390ec] data-[state=active]:text-white hover:opacity-70">
              Зарыбление
          </TabsTrigger>
          <TabsTrigger
            value="Убыль"
            className="flex-1 px-2 py-2.5 bg-transparent border-none text-black text-sm font-medium cursor-pointer text-center rounded-lg transition-all whitespace-nowrap overflow-hidden text-ellipsis data-[state=active]:bg-[#3390ec] data-[state=active]:text-white hover:opacity-70">
              Убыль
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Главное" className="min-h-[100px]">
          <MainForm
            locations={locations}
            location={activeLocation}
            date={activeDate}
            onLocationChange={setActiveLocation}
            onDateChange={setActiveDate}
          />
        </TabsContent>
        <TabsContent value="Контрольный отлов" className="min-h-[100px]">
          <ControlCatchForm
            locations={locations}
            location={activeLocation}
            date={activeDate}
            onLocationChange={setActiveLocation}
            onDateChange={setActiveDate}
          />
        </TabsContent>
        <TabsContent value="Продажа" className="min-h-[100px]">
          <SalesForm
            locations={locations}
            location={activeLocation}
            date={activeDate}
            onLocationChange={setActiveLocation}
            onDateChange={setActiveDate}
          />
        </TabsContent>
        <TabsContent value="Зарыбление" className="min-h-[100px]">
          <FishStockingForm
            locations={locations}
            location={activeLocation}
            date={activeDate}
            onLocationChange={setActiveLocation}
            onDateChange={setActiveDate}
          />
        </TabsContent>
        <TabsContent value="Убыль" className="min-h-[100px]">
          <DeathReportForm
            locations={locations}
            location={activeLocation}
            date={activeDate}
            onLocationChange={setActiveLocation}
            onDateChange={setActiveDate}
          />
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <div className="mb-5 text-center">
          <button 
            onClick={() => navigate('/userManagement')}
            className="w-full px-6 py-3 bg-[var(--tg-theme-button-color,#0088cc)] text-[var(--tg-theme-button-text-color,#ffffff)] border-none rounded-lg cursor-pointer text-sm font-medium hover:opacity-90"
          >
            Управление пользователями
          </button>
        </div>
      )}
    </div>
  )
}

export default Form
