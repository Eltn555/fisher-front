import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { TelegramWebApp } from '../types/telegram'
import './UserManagement.css'

interface User {
  telegramId: number
  fullname: string
  phone: string
  role: 'ADMIN' | 'USER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
}

function UserManagement() {
  const navigate = useNavigate()
  const [tg, setTg] = useState<TelegramWebApp | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentEditorId, setCurrentEditorId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      webApp.ready()
      webApp.expand()
      setTg(webApp)
    }
  }, [])

  useEffect(() => {
    if (tg) {
      loadUsers()
    }
  }, [tg])

  const loadUsers = async () => {
    if (!tg) return

    try {
      const user = await api.getUser()
      
      if (!user || user.role !== 'ADMIN') {
        setError('Доступ запрещен. Только администраторы могут просматривать эту страницу.')
        setLoading(false)
        return
      }

      setCurrentEditorId(user.telegramId)

      // Load all users
      const usersData = await api.getUsers()
      setUsers(usersData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Ошибка загрузки пользователей')
      setLoading(false)
    }
  }

  const updateUser = async (userId: number, role: 'ADMIN' | 'USER' | null, status: 'ACCEPTED' | 'DECLINED' | null) => {
    if (!tg || currentEditorId === null) return

    try {
      const updateData: {
        editorId: number
        userId: number
        role?: 'ADMIN' | 'USER'
        status?: 'ACCEPTED' | 'DECLINED'
      } = {
        editorId: currentEditorId,
        userId: userId,
      }
      
      if (role) {
        updateData.role = role
      }
      if (status) {
        updateData.status = status
      }

      const result = await api.updateUser(updateData)
      
      if (result.success) {
        showMessage('Пользователь обновлен успешно', 'success')
        setTimeout(() => {
          loadUsers()
        }, 1000)
      } else {
        showMessage(result.error || 'Ошибка обновления пользователя', 'error')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showMessage('Ошибка обновления пользователя', 'error')
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return
    }

    if (!tg || currentEditorId === null) return

    try {
      const result = await api.deleteUser({
        editorId: currentEditorId,
        userId: userId,
      })
      
      if (result.success) {
        showMessage('Пользователь удален успешно', 'success')
        setTimeout(() => {
          loadUsers()
        }, 1000)
      } else {
        showMessage(result.error || 'Ошибка удаления пользователя', 'error')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showMessage('Ошибка удаления пользователя', 'error')
    }
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const statusText: Record<string, string> = {
    'PENDING': 'Ожидает',
    'ACCEPTED': 'Принят',
    'DECLINED': 'Отклонен'
  }

  if (loading) {
    return (
      <div className="container">
        <div className="back-btn">
          <button onClick={() => navigate('/')}>← Назад</button>
        </div>
        <h1>Управление пользователями</h1>
        <div className="loading">Загрузка пользователей...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="back-btn">
          <button onClick={() => navigate('/')}>← Назад</button>
        </div>
        <h1>Управление пользователями</h1>
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="back-btn">
        <button onClick={() => navigate('/')}>← Назад</button>
      </div>
      <h1>Управление пользователями</h1>
      
      {message && (
        <div className={`message ${message.type} show`}>
          {message.text}
        </div>
      )}
      
      <table id="usersTable">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Телефон</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.telegramId}>
              <td>{user.fullname || '-'}</td>
              <td>{user.phone || '-'}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>
                  {user.role === 'ADMIN' ? 'Админ' : 'Пользователь'}
                </span>
              </td>
              <td>
                <span className={`status-badge status-${user.status}`}>
                  {statusText[user.status] || user.status}
                </span>
              </td>
              <td>
                <div className="actions">
                  {user.status !== 'ACCEPTED' && (
                    <button
                      className="btn btn-accept"
                      onClick={() => updateUser(user.telegramId, null, 'ACCEPTED')}
                    >
                      Принять
                    </button>
                  )}
                  
                  {user.status !== 'DECLINED' && (
                    <button
                      className="btn btn-decline"
                      onClick={() => updateUser(user.telegramId, null, 'DECLINED')}
                    >
                      Отклонить
                    </button>
                  )}
                  
                  {user.role === 'ADMIN' ? (
                    <button
                      className="btn btn-user"
                      onClick={() => updateUser(user.telegramId, 'USER', null)}
                    >
                      → User
                    </button>
                  ) : (
                    <button
                      className="btn btn-admin"
                      onClick={() => updateUser(user.telegramId, 'ADMIN', null)}
                    >
                      → Admin
                    </button>
                  )}
                  
                  {user.telegramId !== currentEditorId && (
                    <button
                      className="btn btn-delete"
                      onClick={() => deleteUser(user.telegramId)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserManagement
