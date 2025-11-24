import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { reviewService } from '../../services/newFeatures';
import { useNotification } from '../../hooks/useNotification';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      const response = await reviewService.getProductReviews(productId, page, 10);
      setReviews(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showNotification('Error al cargar reseñas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await reviewService.getProductRatingStats(productId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

    try {
      await reviewService.deleteReview(reviewId);
      showNotification('Reseña eliminada exitosamente', 'success');
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar reseña', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.averageRating?.toFixed(1) || '0.0'}
              </div>
              <RatingStars rating={Math.round(stats.averageRating || 0)} readOnly size="sm" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution?.[star] || 0;
                const percentage = stats.totalReviews > 0 
                  ? (count / stats.totalReviews) * 100 
                  : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {star} ★
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Aún no hay reseñas para este producto
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.userName}
                    </span>
                    {review.verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400">
                        ✓ Compra verificada
                      </span>
                    )}
                  </div>
                  <RatingStars rating={review.rating} readOnly size="sm" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  {review.comment}
                </p>
              )}

              {review.vendorResponse && (
                <div className="mt-3 pl-4 border-l-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-3 rounded">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Respuesta del vendedor:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.vendorResponse}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(review.vendorResponseDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

ReviewList.propTypes = {
  productId: PropTypes.number.isRequired
};

export default ReviewList;
