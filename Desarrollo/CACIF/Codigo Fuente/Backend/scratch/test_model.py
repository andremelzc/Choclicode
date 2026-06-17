import google.generativeai as genai
import os

api_key = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=api_key)

models_to_test = [
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-flash-lite-latest",
    "gemini-2.0-flash-lite-001",
    "gemini-2.0-flash"
]

for model_name in models_to_test:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hola, di ok.")
        print(f"SUCCESS: {model_name} -> {response.text.strip()}")
    except Exception as e:
        print(f"FAILED: {model_name} -> {e}")
