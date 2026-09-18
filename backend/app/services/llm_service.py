import os
import ssl
from pathlib import Path

import httpx
import truststore
from dotenv import load_dotenv
from groq import Groq


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class LLMService:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY must be configured in backend/.env")
        self.client = Groq(
            api_key=api_key,
            http_client=httpx.Client(
                verify=truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT),
                timeout=45.0,
            ),
            timeout=45.0,
            max_retries=1,
        )

    def generate(self, prompt: str):

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content
