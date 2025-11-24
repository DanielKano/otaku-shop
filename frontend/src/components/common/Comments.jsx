import { useState } from 'react'
import RatingStars from './RatingStars'
import Button from '../ui/Button'

const Comments = ({ productId, comments = [], onAddComment }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 0,
  })
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title.trim() && formData.content.trim() && formData.rating > 0) {
      onAddComment({
        ...formData,
        productId,
        author: 'Usuario',
        date: new Date().toISOString(),
      })
      setFormData({ title: '', content: '', rating: 0 })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comentarios ({comments.length})
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          size="sm"
        >
          {showForm ? 'Cancelar' : 'Dejar comentario'}
        </Button>
      </div>

      {/* Comment Form */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Calificación
              </label>
              <RatingStars
                rating={formData.rating}
                onRate={(rating) => setFormData({ ...formData, rating })}
                interactive
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resumen de tu opinión"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Comentario
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Comparte tu experiencia con este producto..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Publicar comentario
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {comment.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {comment.author} • {new Date(comment.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <RatingStars rating={comment.rating} interactive={false} />
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Comments
