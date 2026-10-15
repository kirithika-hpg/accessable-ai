from fastapi import APIRouter, HTTPException, status
from app.schemas.assistant import (
    ExplainRequest,
    ExplainResponse,
    SuggestFixRequest,
    SuggestFixResponse,
    SimplifyRequest,
    SimplifyResponse,
    ChatRequest,
    ChatResponse,
)
from app.ai.engine import ai_engine

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/explain", response_model=ExplainResponse)
async def explain_accessibility_issue(payload: ExplainRequest):
    try:
        response = await ai_engine.explain_issue(
            rule_id=payload.rule_id,
            description=payload.description,
            html_snippet=payload.html_snippet,
            target_url=payload.target_url,
            finding_id=payload.finding_id,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate explanation: {str(e)}"
        )

@router.post("/suggest-fix", response_model=SuggestFixResponse)
async def suggest_code_fix(payload: SuggestFixRequest):
    try:
        response = await ai_engine.suggest_fix(
            rule_id=payload.rule_id,
            html_snippet=payload.html_snippet,
            description=payload.description,
            selector=payload.selector,
            finding_id=payload.finding_id,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggested fix: {str(e)}"
        )

@router.post("/simplify", response_model=SimplifyResponse)
async def simplify_content(payload: SimplifyRequest):
    try:
        response = await ai_engine.simplify_text(
            text=payload.text,
            level=payload.level or "plain_english"
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simplify text: {str(e)}"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest):
    try:
        response = await ai_engine.chat_guidance(
            message=payload.message,
            context=payload.context
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process guidance request: {str(e)}"
        )
