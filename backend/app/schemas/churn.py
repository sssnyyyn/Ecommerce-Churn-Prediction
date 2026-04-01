from pydantic import BaseModel
from typing import Optional

class PredictResponse(BaseModel):
    customer_id: str
    churn_probability: float
    marketing_message: str
