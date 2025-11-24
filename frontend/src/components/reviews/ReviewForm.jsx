import { useState } from 'react';
import PropTypes from 'prop-types';
import { reviewService } from '../../services/newFeatures';
import { useNotification } from '../../hooks/useNotification';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';

const ReviewForm = ({ productId, onReviewSubmitted, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showNotification('Por favor selecciona una calificación', 'error');
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        productId,
        rating,
        comment: comment.trim() || null
      };

      if (existingReview) {
        await reviewService.updateReview(existingReview.id, reviewData);
        showNotification('Reseña actualizada exitosamente', 'success');
      } else {
        await reviewService.createReview(reviewData);
        showNotification('Reseña publicada exitosamente', 'success');
      }

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Resetear formulario si es una nueva reseña
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(
        error.response?.data?.message || 'Error al guardar la reseña',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Calificación *
        </label>
        <RatingStars
          rating={rating}
          onRatingChange={setRating}
          readOnly={false}
          size="lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia con este producto..."
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comment.length}/1000 caracteres
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading || rating === 0}
        >
          {existingReview ? 'Actualizar Reseña' : 'Publicar Reseña'}
        </Button>
      </div>
    </form>
  );
};

ReviewForm.propTypes = {
  productId: PropTypes.number.isRequired,
  onReviewSubmitted: PropTypes.func,
  existingReview: PropTypes.object
};

export default ReviewForm;
