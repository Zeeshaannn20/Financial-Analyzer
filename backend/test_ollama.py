import ollama
try:
    response = ollama.list()
    print("Ollama connection successful")
    print(f"Available models: {[m['name'] for m in response['models']]}")
    
    # Try a simple chat
    res = ollama.chat(model='gemma4:e4b', messages=[{'role': 'user', 'content': 'Hi'}])
    print(f"Chat test successful: {res['message']['content'][:50]}...")
except Exception as e:
    print(f"Ollama connection failed: {e}")
