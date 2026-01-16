import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RentalObjectCard } from '../blocks/RentalObjectCard';

const defaultProps = {
  id: 'test-1',
  name: 'Test Venue',
  type: 'Conference Room',
  location: 'Oslo, Norway',
  description: 'A beautiful conference room for meetings.',
  image: 'https://example.com/image.jpg',
};

describe('RentalObjectCard', () => {
  describe('Grid variant (default)', () => {
    it('renders the listing name', () => {
      render(<RentalObjectCard {...defaultProps} />);
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
    });

    it('renders the location', () => {
      render(<RentalObjectCard {...defaultProps} />);
      expect(screen.getByText('Oslo, Norway')).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<RentalObjectCard {...defaultProps} />);
      expect(screen.getByText('A beautiful conference room for meetings.')).toBeInTheDocument();
    });

    it('renders the image with correct alt text', () => {
      render(<RentalObjectCard {...defaultProps} />);
      const image = screen.getByAltText('Test Venue');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<RentalObjectCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByText('Test Venue').closest('.listing-card');
      if (card) fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledWith('test-1');
    });

    it('renders favorite button when onFavorite is provided', () => {
      const handleFavorite = vi.fn();
      render(<RentalObjectCard {...defaultProps} onFavorite={handleFavorite} />);

      const favoriteButton = screen.getByTitle('Legg til favoritter');
      expect(favoriteButton).toBeInTheDocument();
    });

    it('calls onFavorite handler when favorite button is clicked', () => {
      const handleFavorite = vi.fn();
      render(<RentalObjectCard {...defaultProps} onFavorite={handleFavorite} />);

      const favoriteButton = screen.getByTitle('Legg til favoritter');
      fireEvent.click(favoriteButton);

      expect(handleFavorite).toHaveBeenCalledWith('test-1');
    });

    it('renders capacity when provided', () => {
      render(<RentalObjectCard {...defaultProps} capacity={20} />);
      expect(screen.getByText('20 personer')).toBeInTheDocument();
    });

    it('renders facilities tags', () => {
      render(
        <RentalObjectCard
          {...defaultProps}
          facilities={['WiFi', 'Parking', 'Kitchen']}
        />
      );

      expect(screen.getByText('WiFi')).toBeInTheDocument();
      expect(screen.getByText('Parking')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
    });

    it('renders listing type badge when provided', () => {
      render(<RentalObjectCard {...defaultProps} listingType="SPACE" />);
      expect(screen.getByText('Lokale')).toBeInTheDocument();
    });
  });

  describe('Detailed variant', () => {
    it('renders in detailed variant', () => {
      render(<RentalObjectCard {...defaultProps} variant="detailed" />);
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
      expect(screen.getByText('Se detaljer →')).toBeInTheDocument();
    });

    it('renders close button when onClose is provided', () => {
      const handleClose = vi.fn();
      render(<RentalObjectCard {...defaultProps} variant="detailed" onClose={handleClose} />);

      const closeButton = screen.getByLabelText('Lukk');
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(<RentalObjectCard {...defaultProps} variant="detailed" onClose={handleClose} />);

      const closeButton = screen.getByLabelText('Lukk');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('renders availability status', () => {
      render(<RentalObjectCard {...defaultProps} variant="detailed" available={true} />);
      expect(screen.getByText('Ledig')).toBeInTheDocument();
    });

    it('renders unavailable status', () => {
      render(<RentalObjectCard {...defaultProps} variant="detailed" available={false} />);
      expect(screen.getByText('Opptatt')).toBeInTheDocument();
    });
  });

  describe('Visibility toggles', () => {
    it('hides location when showLocation is false', () => {
      render(<RentalObjectCard {...defaultProps} showLocation={false} />);
      expect(screen.queryByText('Oslo, Norway')).not.toBeInTheDocument();
    });

    it('hides description when showDescription is false', () => {
      render(<RentalObjectCard {...defaultProps} showDescription={false} />);
      expect(screen.queryByText('A beautiful conference room for meetings.')).not.toBeInTheDocument();
    });

    it('hides capacity when showCapacity is false', () => {
      render(<RentalObjectCard {...defaultProps} capacity={20} showCapacity={false} />);
      expect(screen.queryByText('20 personer')).not.toBeInTheDocument();
    });
  });
});
