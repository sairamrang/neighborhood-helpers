import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewForm = ({ bookingId, providerId, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to submit a review');
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        provider_id: providerId,
        resident_id: user.id,
        rating,
        feedback: feedback.trim() || null,
      });

      if (error) throw error;

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            className="text-5xl transition-all transform hover:scale-110 focus:outline-none"
          >
            {star <= (hoveredRating || rating) ? (
              <span className="text-yellow-400 drop-shadow-glow">⭐</span>
            ) : (
              <span className="text-gray-300">⭐</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl">
        <h2 className="text-2xl font-display font-bold text-center mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Rate Your Experience
        </h2>
        <p className="text-center text-gray-600 mb-6">
          How was your service? Help others by sharing your feedback!
        </p>

        <form onSubmit={handleSubmit}>
          {renderStars()}

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Share Your Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              {feedback.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
