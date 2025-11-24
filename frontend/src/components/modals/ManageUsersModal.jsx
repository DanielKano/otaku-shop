import { useState, useEffect } from 'react'
import services from '../../services'
import Button from '../ui/Button'

const ManageUsersModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await services.userService.getAll()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId) => {
    try {
      setActionLoading(userId)
      // Llamar endpoint de suspender (si existe)
      // await services.userService.suspend(userId)
      console.log('Suspending user:', userId)
      // setUsers(users.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error suspending user:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        setActionLoading(userId)
        // await services.userService.delete(userId)
        console.log('Deleting user:', userId)
        // setUsers(users.filter(u => u.id !== userId))
      } catch (error) {
        console.error('Error deleting user:', error)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      vendedor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cliente: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestionar Usuarios
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Rol</th>
                    <th className="px-4 py-3 text-center text-gray-900 dark:text-white font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleSuspend(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            ⏸ Suspender
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            🗑 Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No hay usuarios
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {users.length} usuarios
          </p>
          <Button 
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ManageUsersModal
