import '@testing-library/jest-dom'
import '@testing-library/jest-dom'

// Mock canvas-confetti
jest.mock('canvas-confetti', () => ({
    __esModule: true,
    default: jest.fn(),
}));
// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
