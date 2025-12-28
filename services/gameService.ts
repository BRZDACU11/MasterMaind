
import { Color, Feedback } from '../types';

/**
 * Sends a guess to the backend API and receives feedback.
 * Note: This implementation targets a Python API as requested.
 * We include a mock fallback to ensure the app works out of the box.
 */
export const checkGuessApi = async (guess: Color[], solution?: Color[]): Promise<Feedback> => {
  // If we have a real backend URL, we would use it here:
  // const API_URL = 'http://localhost:8000/api/check-guess';
  
  try {
    /* 
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess, solution }) // Solution might be managed server-side
    });
    if (!response.ok) throw new Error('API Error');
    return await response.json();
    */

    // MOCK IMPLEMENTATION (Simulating local calculation if API is unavailable)
    if (!solution) throw new Error("Solution required for local verification");
    
    let black = 0;
    let white = 0;
    
    const solutionCopy = [...solution];
    const guessCopy = [...guess];
    
    // First pass: Black pegs
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] === solutionCopy[i]) {
        black++;
        solutionCopy[i] = null as any;
        guessCopy[i] = null as any;
      }
    }
    
    // Second pass: White pegs
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] !== null) {
        const index = solutionCopy.indexOf(guessCopy[i]);
        if (index !== -1) {
          white++;
          solutionCopy[index] = null as any;
        }
      }
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return { black, white };
  } catch (error) {
    console.error("Failed to check guess:", error);
    throw error;
  }
};
