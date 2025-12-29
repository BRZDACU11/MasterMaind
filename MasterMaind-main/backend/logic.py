from typing import List, Tuple
from collections import Counter

def calculate_hits(secret: List[str], guess: List[str]) -> Tuple[int, int]:
    """
    Calculates the number of black and white hits.
    
    Args:
        secret: The secret code (list of colors).
        guess: The player's guess (list of colors).
        
    Returns:
        A tuple (black_hits, white_hits).
    """
    if len(secret) != len(guess):
        raise ValueError("Secret and guess must have the same length.")

    black_hits = 0
    white_hits = 0
    
    # We will use counters to track the remaining colors for white hit calculation
    secret_remainder = []
    guess_remainder = []

    # First pass: Check for black hits (correct color at correct position)
    for s, g in zip(secret, guess):
        if s == g:
            black_hits += 1
        else:
            secret_remainder.append(s)
            guess_remainder.append(g)

    # Second pass: Check for white hits (correct color at wrong position)
    # We count the occurrences of each color in the remainders
    secret_counter = Counter(secret_remainder)
    guess_counter = Counter(guess_remainder)

    # For each color in the guess remainder, it contributes to a white hit
    # if it exists in the secret remainder. The number of contributions is
    # the minimum of the counts in both remainders.
    for color in guess_counter:
        if color in secret_counter:
            white_hits += min(guess_counter[color], secret_counter[color])

    return black_hits, white_hits
