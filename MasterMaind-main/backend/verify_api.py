import requests
import json
import time
import subprocess
import sys
import os

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("Starting API verification...")
    
    # 1. Start a game
    try:
        print("Testing POST /start ...")
        start_res = requests.post(f"{BASE_URL}/start")
        start_res.raise_for_status()
        data = start_res.json()
        game_id = data.get("game_id")
        if not game_id:
            print("FAILED: No game_id returned.")
            return False
        print(f"PASS: Game started with ID: {game_id}")
    except Exception as e:
        print(f"FAILED: Could not start game. Error: {e}")
        return False

    # 2. Make a guess
    try:
        print("Testing POST /guess ...")
        # We don't know the secret, so we just guess something
        guess_payload = {
            "game_id": game_id,
            "guess": ["red", "blue", "green", "yellow"]
        }
        guess_res = requests.post(f"{BASE_URL}/guess", json=guess_payload)
        guess_res.raise_for_status()
        result = guess_res.json()
        
        if "black" not in result or "white" not in result:
             print("FAILED: Invalid response structure for guess.")
             return False
        
        print(f"PASS: Guess result: {result}")
    except Exception as e:
        print(f"FAILED: Could not make guess. Error: {e}")
        return False

    print("ALL TESTS PASSED!")
    return True

if __name__ == "__main__":
    # Ensure uvicorn is installed or available
    # We will assume the server is being started by the agent separately or we start it here
    # For this script, let's try to ping the server, if it's not up, we fail.
    if not test_api():
        sys.exit(1)
