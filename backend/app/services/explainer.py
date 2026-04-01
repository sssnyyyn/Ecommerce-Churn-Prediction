import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

logger = logging.getLogger(__name__)

def generate_marketing_message(customer_data: dict) -> str:
    """
    고객의 RFM 데이터를 기반으로 맞춤형 마케팅 메시지를 생성합니다.
    """
    try:
        # LLM 인스턴스 초기화
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            google_api_key=os.getenv("GEMINI_API_KEY")
        )

        prompt_template = """
        당신은 E-Commerce 플랫폼의 CRM 마케터입니다.
        다음 고객 데이터를 분석하여 이탈 방지를 위한 개인화된 마케팅 메시지를 작성해 주십시오.

        [고객 데이터]
        - 최근 구매 경과일 (Recency): {recency}일
        - 총 구매 횟수 (Frequency): {frequency}회
        - 총 구매 금액 (Monetary): {monetary}원
        - 예상 이탈 확률 (Churn Probability): {churn_probability}%

        [작성 가이드라인]
        1. 고객의 이탈 위험도에 맞춰 어조를 조절하십시오.
        2. 고객의 구매 이력(RFM)을 기반으로 한 개인화된 언급을 포함하십시오.
        3. 재구매를 유도할 수 있는 적절한 쿠폰 또는 할인 혜택을 제안하십시오.
        4. 전체 문장은 3줄 이내로 간결하게 작성하십시오.

        마케팅 메시지:
        """

        prompt = PromptTemplate(
            input_variables=["recency", "frequency", "monetary", "churn_probability"],
            template=prompt_template
        )

        chain = prompt | llm

        response = chain.invoke({
            "recency": customer_data.get("recency", 0),
            "frequency": customer_data.get("frequency", 0),
            "monetary": customer_data.get("monetary", 0),
            "churn_probability": round(customer_data.get("churn_probability", 0.0) * 100, 1)
        })

        return response.content

    except Exception as e:
        logger.error(f"Failed to generate marketing message: {e}")
        return "고객님을 위한 특별한 혜택이 준비되어 있습니다. 홈페이지에서 확인해 주십시오."
