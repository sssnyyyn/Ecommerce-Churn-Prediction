import json
import logging
from fastapi import APIRouter, HTTPException
from app.schemas.churn import PredictResponse
from app.services.explainer import generate_marketing_message

logger = logging.getLogger(__name__)
router = APIRouter()

# 전처리된 LLM 컨텍스트 데이터 로드
DATA_PATH = "data/processed/llm_context.json"
llm_context_data = {}

try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

        # JSON 데이터가 리스트 형태인 경우, customer_id를 키값으로 하는 딕셔너리로 변환 (조회 성능 O(1) 최적화)
        if isinstance(raw_data, list):
            llm_context_data = {str(item.get("customer_id")): item for item in raw_data}
        # 이미 딕셔너리 형태인 경우, 키값을 문자열로 통일
        elif isinstance(raw_data, dict):
            llm_context_data = {str(k): v for k, v in raw_data.items()}

    logger.info("Successfully loaded and processed llm_context.json.")
except FileNotFoundError:
    logger.warning("llm_context.json file not found. Ensure the data pipeline has been executed.")

@router.get("/predict/{customer_id}", response_model=PredictResponse)
async def predict_customer_churn(customer_id: str):
    """
    단일 고객의 이탈 확률을 조회하고 AI 기반 맞춤형 마케팅 메시지를 반환합니다.
    """
    # customer_id를 문자열로 명시적 변환하여 조회
    customer_data = llm_context_data.get(str(customer_id))

    # 404 에러 핸들링
    if not customer_data:
        raise HTTPException(status_code=404, detail=f"Customer data not found for ID: {customer_id}")

    # 마케팅 메시지 생성
    marketing_message = generate_marketing_message(customer_data)

    return PredictResponse(
        customer_id=customer_id,
        churn_probability=customer_data.get("churn_probability", 0.0),
        marketing_message=marketing_message
    )
