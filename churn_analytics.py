import streamlit as st
import pandas as pd
import numpy as np
import joblib

# 1. 모델 및 전처리 객체 로드
@st.cache_resource
def load_artifacts():
    # 저장된 모델, 인코더, 임계값 로드
    model = joblib.load("data/olist_xgboost_model.pkl")
    encoders = joblib.load("data/olist_labelencoders.pkl")
    best_threshold = joblib.load("data/best_threshold.pkl")

    # 모델이 학습할 때 사용한 전체 피처 이름 리스트 추출 (매우 중요)
    # 이 리스트에는 'Monetary' 등 수치형과 'Customer_State_SP' 등 더미 변수가 모두 포함됨
    model_features = model.get_booster().feature_names

    return model, encoders, best_threshold, model_features

model, encoders, best_threshold, model_features = load_artifacts()

# --- UI 설정 ---
st.set_page_config(page_title="Olist Churn Analytics", layout="wide")

st.title("🛍️ Olist 고객 이탈 예측 및 매니지먼트 시스템")
st.markdown("""
이 대시보드는 고객의 과거 행동 데이터를 기반으로 **이탈 확률을 예측**하고,
비즈니스 임팩트를 최소화하기 위한 **맞춤형 대응 전략**을 제안합니다.
""")

# --- 사이드바: 데이터 입력 ---
st.sidebar.header("👤 고객 행동 데이터 입력")

with st.sidebar:
    st.subheader("결제 및 구매 패턴")
    monetary = st.number_input("누적 결제액 (Monetary)", 0.0, 5000.0, 150.0)
    total_items = st.number_input("총 구매 상품 수 (Total Items)", 1, 50, 1)
    avg_price = st.number_input("평균 상품 단가 (Avg Price)", 0.0, 5000.0, 100.0)

    st.divider()
    st.subheader("서비스 품질 지표")
    avg_delivery_delay = st.slider("평균 배송 지연 일수", 0, 30, 0)
    avg_review_score = st.slider("평균 리뷰 점수", 1.0, 5.0, 4.0, 0.5)

    st.divider()
    # 인코더에 저장된 지역 클래스 리스트 활용
    customer_state = st.selectbox("거주 지역 (State)", encoders['Customer_State'].classes_)

# --- 메인 분석 로직 ---
if st.sidebar.button("이탈 위험도 분석 실행"):
    #

    # 2. 모델 학습 시와 동일한 데이터 구조(One-Hot Encoding) 생성
    # 모든 피처가 0으로 채워진 데이터프레임을 생성 (모델이 요구하는 31개 등 전체 컬럼 기준)
    input_data = pd.DataFrame(0, index=[0], columns=model_features)

    # 수치형 피처 값 채우기
    input_data['Monetary'] = monetary
    input_data['Avg_Price'] = avg_price
    input_data['Total_Items'] = total_items
    input_data['Avg_Delivery_Delay'] = avg_delivery_delay
    input_data['Avg_Review_Score'] = avg_review_score

    # 범주형 피처 처리: 선택된 지역에 해당하는 더미 변수만 1로 설정
    # 학습 시 pd.get_dummies가 생성한 'Customer_State_지역코드' 형식과 일치시킴
    state_col = f"Customer_State_{customer_state}"
    if state_col in model_features:
        input_data[state_col] = 1

    # 3. 모델 예측 (확률 및 임계값 적용)
    # 2D 데이터프레임을 그대로 전달하여 feature_names mismatch 에러 방지
    churn_proba = model.predict_proba(input_data)[0][1]
    is_churn = 1 if churn_proba >= best_threshold else 0

    # --- 결과 출력 ---
    st.divider()
    col1, col2 = st.columns([1, 1.5])

    with col1:
        st.subheader("🔍 분석 결과")
        st.metric(label="이탈 예측 확률", value=f"{churn_proba*100:.1f}%")

        if is_churn == 1:
            st.error(f"⚠️ 결과: **이탈 위험 고객군**")
            st.progress(float(churn_proba))
        else:
            st.success(f"✅ 결과: **유지 안정 고객군**")
            st.progress(float(churn_proba))

    with col2:
        st.subheader("💡 추천 비즈니스 액션")
        if is_churn == 1:
            if avg_delivery_delay > 7:
                st.warning("📍 **물류 개선 시급**: 잦은 배송 지연이 이탈의 주원인입니다. 사과 메시지와 배송비 면제 쿠폰을 발송하세요.")
            elif avg_review_score < 3:
                st.warning("📍 **품질 관리 필요**: 서비스 만족도가 낮습니다. CS팀의 전담 해피콜을 통해 불만 사항을 접수하세요.")
            else:
                st.info("📍 **리마케팅 권장**: 특별한 불만은 없으나 활동이 뜸해진 상태입니다. 개인화된 추천 상품 알림을 보내세요.")
        else:
            st.info("📍 **로열티 강화**: VIP 전용 혜택 안내 및 신규 카테고리 확장을 위한 크로스셀링 캠페인을 진행하세요.")

else:
    st.info("왼쪽 사이드바에서 데이터를 입력한 후 '분석 실행' 버튼을 눌러주세요.")
