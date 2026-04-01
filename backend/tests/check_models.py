import os
import google.generativeai as genai
from dotenv import load_dotenv

# .env 파일에서 API 키 로드
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API 키를 찾을 수 없습니다. .env 파일을 확인해 주십시오.")
    exit()

genai.configure(api_key=api_key)

print("현재 API 키로 사용 가능한 모델 목록:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("모델 목록 조회 중 에러가 발생했습니다:", e)
