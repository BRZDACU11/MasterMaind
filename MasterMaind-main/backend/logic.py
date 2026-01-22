from typing import List, Tuple
from collections import Counter

import random

def calculate_hits(secret: List[str], guess: List[str]) -> Tuple[int, int]:
    """
    Liczy ile mamy "czarnych" trafień (dobry kolor, dobre miejsce)
    i "białych" (dobry kolor, ale złe miejsce).
    """
    if len(secret) != len(guess):
        raise ValueError("Secret and guess must have the same length.")

    black_hits = 0
    white_hits = 0
    
    # Używamy liczników, żeby sprawdzić co zostało do policzenia "białych" trafień
    secret_remainder = []
    guess_remainder = []

    # Krok pierwszy: szukamy idealnych trafień (ten sam kolor i pozycja)
    for s, g in zip(secret, guess):
        if s == g:
            black_hits += 1
        else:
            secret_remainder.append(s)
            guess_remainder.append(g)

    # Krok drugi: sprawdzamy ile kolorów się zgadza, ale są na innych pozycjach
    # Liczymy ile razy dany kolor wystąpił w tym, co zostało
    secret_counter = Counter(secret_remainder)
    guess_counter = Counter(guess_remainder)

    # Dla każdego koloru z próby sprawdzamy, czy był w kodzie.
    # Wynik to minimum z liczby wystąpień w obu listach.
    for color in guess_counter:
        if color in secret_counter:
            white_hits += min(guess_counter[color], secret_counter[color])

    return black_hits, white_hits

def generate_hint(secret: List[str]) -> str:
    """
    Generuje losową podpowiedź o ukrytym kodzie, żeby gracz miał łatwiej.
    """
    hint_type = random.choice(['existence', 'position'])
    
    if hint_type == 'existence':
        # Zdradzamy, że jakiś kolor w ogóle istnieje w kodzie
        color = random.choice(secret)
        return f"W kodzie znajduje się kolor: {color}."
    else:
        # Zdradzamy konkretny kolor na konkretnym miejscu
        idx = random.randint(0, len(secret) - 1)
        color = secret[idx]
        return f"Na pozycji {idx + 1} znajduje się kolor: {color}."
