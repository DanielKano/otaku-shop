import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import services from '../../services'

const ROLES = ['cliente', 'vendedor', 'admin']  // superadmin eliminado - solo creación manual en BD
const ROLE_LABELS = {
  cliente: 'Cliente',
  vendedor: 'Vendedor',
  admin: 'Admin',
  superadmin: 'SuperAdmin',  // Solo para mostrar, no para seleccionar
}

const ChangeRolesModal = ({ isOpen, onClose, onRoleChanged }) => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      const response = await services.userService.getAll()
      setUsers(response.data || [])
      setError('')
    } catch (err) {
      setError('Error al cargar usuarios')
      console.error(err)
    }
  }

  const handleRoleChange = async (e) => {
    e.preventDefault()

    if (!selectedUser || !newRole) {
      setError('Por favor selecciona un usuario y un rol')
      return
    }

    setLoading(true)

    try {
      await services.userService.changeRole(selectedUser.id, newRole)
      
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, role: newRole }
          : u
      ))
      
      onRoleChanged(selectedUser, newRole)
      setSelectedUser(null)
      setNewRole('')
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar rol')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Cambiar Roles de Usuarios
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecciona Usuario
            </label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === parseInt(e.target.value))
                setSelectedUser(user)
                setNewRole(user?.role || '')
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un usuario --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {ROLE_LABELS[user.role] || user.role}
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Usuario actual:</strong> {selectedUser.name} ({selectedUser.email})
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Rol actual:</strong> {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nuevo Rol
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Selecciona un rol --</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Users List Preview */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Lista de Usuarios ({users.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg border transition ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleRoleChange}
            disabled={loading || !selectedUser || !newRole}
          >
            {loading ? 'Actualizando...' : 'Cambiar Rol'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChangeRolesModal
