import os
import json
import time

from pathlib import Path
from dotenv import load_dotenv
from google import genai


# Load environment variables
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env", override=True)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from backend/.env")


# Initialize Gemini
client = genai.Client(api_key=API_KEY)


def qualify_lead(customer_name: str, message: str):

    prompt = f"""
You are an expert AI sales qualification assistant.

Analyse this customer enquiry.

Customer Name: {customer_name}
Customer Enquiry: {message}

Return ONLY valid JSON with these fields:

{{
    "intent": "Brief description of customer intent",
    "lead_priority": "High, Medium, or Low",
    "customer_sentiment": "Positive, Neutral, or Negative",
    "summary": "Short summary of the enquiry",
    "recommended_action": "Recommended next action",
    "follow_up_message": "A personalised suggested follow-up message"
}}

Rules:
- Never invent customer information.
- Base priority on the actual enquiry.
- Keep recommendations practical.
- Do not claim that a follow-up has been sent.
"""

    # Retry up to 3 times for temporary API failures
    for attempt in range(3):

        try:
            print(f"Gemini analysis attempt {attempt + 1}/3")

            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )

            if not response.text:
                raise ValueError("Gemini returned an empty response")

            return json.loads(response.text)

        except Exception as error:

            error_message = str(error).upper()

            temporary_error = any(
                code in error_message
                for code in [
                    "503",
                    "UNAVAILABLE",
                    "429",
                    "RESOURCE_EXHAUSTED",
                    "500",
                    "INTERNAL"
                ]
            )

            if temporary_error and attempt < 2:
                wait_time = 2 ** (attempt + 1)

                print(
                    f"Gemini temporarily unavailable. "
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)

            else:
                print(f"Gemini qualification failed: {error}")
                raise