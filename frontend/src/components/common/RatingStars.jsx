import { useState } from 'react'
import Button from '../ui/Button'

const RatingStars = ({ rating = 0, onRatingChange, readOnly = true, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size]

  const displayRating = hoverRating || rating

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readOnly && onRatingChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`${sizeClass} transition cursor-pointer ${!readOnly && 'hover:scale-110'} ${
            star <= displayRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </button>
      ))}
      {!readOnly && rating > 0 && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 align-middle">
          {rating}/5
        </span>
      )}
    </div>
  )
}

export default RatingStars
