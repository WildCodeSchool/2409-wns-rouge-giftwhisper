// Simple utility function to test
const formatPrice = (price: number): string => {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  return `${price.toFixed(2)} €`;
};

// Function to calculate total price with tax
const calculateTotalWithTax = (price: number, taxRate: number = 0.2): number => {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }
  return price * (1 + taxRate);
};

// Unit tests
describe.skip('Utility functions', () => {
  describe('formatPrice', () => {
    it('should correctly format a price', () => {
      expect(formatPrice(10)).toBe('10.00 €');
      expect(formatPrice(10.5)).toBe('10.50 €');
      expect(formatPrice(0)).toBe('0.00 €');
    });

    it('should throw an error for a negative price', () => {
      expect(() => formatPrice(-10)).toThrow('Price cannot be negative');
    });
  });

  describe('calculateTotalWithTax', () => {
    it('should correctly calculate price with default tax rate (20%)', () => {
      expect(calculateTotalWithTax(100)).toBe(120);
      expect(calculateTotalWithTax(50)).toBe(60);
    });

    it('should throw an error for a negative price', () => {
      expect(() => calculateTotalWithTax(-10)).toThrow('Price cannot be negative');
    });

    it('should throw an error for an invalid tax rate', () => {
      expect(() => calculateTotalWithTax(100, -0.1)).toThrow('Tax rate must be between 0 and 1');
      expect(() => calculateTotalWithTax(100, 1.5)).toThrow('Tax rate must be between 0 and 1');
    });
  });
}); 