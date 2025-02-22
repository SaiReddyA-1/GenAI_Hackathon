import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating = 5 }) => {
  return (
    <div className="star-rating">
      {[...Array(rating)].map((_, index) => (
        <FaStar key={index} className="star-icon" />
      ))}
    </div>
  );
};

export default StarRating;
