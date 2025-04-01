import { jest } from '@jest/globals';
import { fetchPricingData } from './dataLoader.js';

describe('fetchPricingData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and parse pricing data from a valid URL', async () => {
    const mockResponse = {
      price: '$10',
      currency: 'USD',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const url = 'https://example.com/pricing';
    const pricingData = await fetchPricingData(url);

    expect(fetch).toHaveBeenCalledWith(url);
    expect(pricingData).toEqual(mockResponse);
  });

  it('should handle errors when fetching data', async () => {
    global.fetch = jest.fn(() => Promise.reject('Failed to fetch'));

    const url = 'https://example.com/pricing';
    const pricingData = await fetchPricingData(url);

    expect(fetch).toHaveBeenCalledWith(url);
    expect(pricingData).toBeNull();
  });

  it('should handle errors when parsing invalid JSON', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      })
    );

    const url = 'https://example.com/pricing';
    const pricingData = await fetchPricingData(url);

    expect(fetch).toHaveBeenCalledWith(url);
    expect(pricingData).toBeNull();
  });
});
