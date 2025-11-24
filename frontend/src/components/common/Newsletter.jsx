import { useState } from 'react'
import Button from '../ui/Button'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
      <h3 className="text-2xl font-bold mb-2">📬 Newsletter</h3>
      <p className="text-blue-100 mb-4">
        Suscríbete para recibir ofertas exclusivas y actualizaciones
      </p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-white/20 text-white placeholder-blue-100 border border-white/30 focus:outline-none focus:border-white"
        />
        <Button
          type="submit"
          variant="outline"
          className="text-white border-white hover:bg-white/10"
        >
          Suscribir
        </Button>
      </form>
      {subscribed && (
        <p className="text-green-200 mt-2">¡Gracias por suscribirte!</p>
      )}
    </div>
  )
}

export default Newsletter
