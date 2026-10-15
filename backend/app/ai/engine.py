import json
import re
import httpx
from typing import Optional, Dict, Any, List
from app.config import settings
from app.ai.rules_db import get_rule_knowledge
from app.schemas.assistant import (
    ExplainResponse,
    SuggestFixResponse,
    DisabilityImpact,
    WcagReference,
    SimplifyResponse,
    ChatResponse,
)

PLAIN_ENGLISH_SUBSTITUTIONS = {
    r"\butilize\b": "use",
    r"\butilizing\b": "using",
    r"\bfacilitate\b": "help",
    r"\bcommence\b": "start",
    r"\bterminate\b": "end",
    r"\bconsequently\b": "so",
    r"\bdemonstrate\b": "show",
    r"\bsubsequently\b": "later",
    r"\bregarding\b": "about",
    r"\bapproximately\b": "about",
    r"\bimplement\b": "set up",
    r"\bsufficient\b": "enough",
    r"\bendeavor\b": "try",
    r"\baccommodate\b": "help",
    r"\bexclusively\b": "only",
    r"\bdisseminate\b": "share",
    r"\bnecessitate\b": "require",
    r"\bpredominantly\b": "mostly",
    r"\bterminate\b": "stop",
    r"\bprocure\b": "get",
    r"\binitiate\b": "start",
    r"\boptimal\b": "best",
}

class AiRemediationEngine:
    """
    AI-powered accessibility remediation engine supporting live LLM completions (Gemini)
    with a deterministic, context-aware WCAG rule knowledge base fallback.
    """

    async def explain_issue(
        self,
        rule_id: str,
        description: str,
        html_snippet: Optional[str] = None,
        target_url: Optional[str] = None,
        finding_id: Optional[str] = None
    ) -> ExplainResponse:
        rule_data = get_rule_knowledge(rule_id)

        # If Gemini API key is configured, query LLM for customized contextual explanation
        if settings.GEMINI_API_KEY:
            try:
                llm_response = await self._call_gemini_explain(rule_id, description, html_snippet, target_url)
                if llm_response:
                    return ExplainResponse(
                        finding_id=finding_id,
                        rule_id=rule_id,
                        simple_explanation=llm_response.get("simple_explanation", rule_data["simple_explanation"]),
                        why_it_matters=llm_response.get("why_it_matters", rule_data["why_it_matters"]),
                        impact_by_disability=DisabilityImpact(**llm_response.get("impact_by_disability", rule_data["impact_by_disability"])),
                        wcag_reference=WcagReference(**rule_data["wcag_reference"])
                    )
            except Exception as e:
                print(f"[AI Engine] LLM call failed, utilizing rule database: {e}")

        # Deterministic Knowledge Base
        return ExplainResponse(
            finding_id=finding_id,
            rule_id=rule_id,
            simple_explanation=rule_data["simple_explanation"],
            why_it_matters=rule_data["why_it_matters"],
            impact_by_disability=DisabilityImpact(**rule_data["impact_by_disability"]),
            wcag_reference=WcagReference(**rule_data["wcag_reference"])
        )

    async def suggest_fix(
        self,
        rule_id: str,
        html_snippet: str,
        description: Optional[str] = None,
        selector: Optional[str] = None,
        finding_id: Optional[str] = None
    ) -> SuggestFixResponse:
        rule_data = get_rule_knowledge(rule_id)
        fix_generator = rule_data.get("fix_generator")
        base_fix = fix_generator(html_snippet) if fix_generator else {}

        # If Gemini API key is configured, query LLM for customized code synthesis
        if settings.GEMINI_API_KEY:
            try:
                llm_fix = await self._call_gemini_fix(rule_id, html_snippet, description, selector)
                if llm_fix:
                    return SuggestFixResponse(
                        finding_id=finding_id,
                        rule_id=rule_id,
                        original_snippet=html_snippet,
                        suggested_snippet=llm_fix.get("suggested_snippet", base_fix.get("suggested_snippet", html_snippet)),
                        css_suggestion=llm_fix.get("css_suggestion", base_fix.get("css_suggestion")),
                        alt_text_suggestion=llm_fix.get("alt_text_suggestion", base_fix.get("alt_text_suggestion")),
                        explanation_of_fix=llm_fix.get("explanation_of_fix", base_fix.get("explanation_of_fix", "")),
                        verification_instructions=llm_fix.get("verification_instructions", base_fix.get("verification_instructions", ""))
                    )
            except Exception as e:
                print(f"[AI Engine] LLM call failed, utilizing rule database: {e}")

        return SuggestFixResponse(
            finding_id=finding_id,
            rule_id=rule_id,
            original_snippet=html_snippet,
            suggested_snippet=base_fix.get("suggested_snippet", html_snippet),
            css_suggestion=base_fix.get("css_suggestion"),
            alt_text_suggestion=base_fix.get("alt_text_suggestion"),
            explanation_of_fix=base_fix.get("explanation_of_fix", "Applied standard WCAG 2.1 accessible markup pattern."),
            verification_instructions=base_fix.get("verification_instructions", "Inspect the element in browser developer tools to verify compliance.")
        )

    async def simplify_text(self, text: str, level: str = "plain_english") -> SimplifyResponse:
        """
        Simplifies input text into Plain English (WCAG 3.1.5) for Cognitive Accessibility Mode.
        """
        clean_input = text.strip()
        if not clean_input:
            return SimplifyResponse(
                original_text="",
                simplified_text="",
                key_points=[],
                reading_level="Elementary",
            )

        if settings.GEMINI_API_KEY:
            try:
                llm_simplified = await self._call_gemini_simplify(clean_input, level)
                if llm_simplified:
                    return SimplifyResponse(
                        original_text=clean_input,
                        simplified_text=llm_simplified.get("simplified_text", clean_input),
                        key_points=llm_simplified.get("key_points", []),
                        reading_level=llm_simplified.get("reading_level", "Plain English (Grade 6-8)"),
                    )
            except Exception as e:
                print(f"[AI Engine] Gemini simplification failed, using rule fallback: {e}")

        # Deterministic Rule-Based Simplification Fallback
        simplified = clean_input
        for pattern, replacement in PLAIN_ENGLISH_SUBSTITUTIONS.items():
            simplified = re.sub(pattern, replacement, simplified, flags=re.IGNORECASE)

        # Split sentences and extract key points
        sentences = [s.strip() for s in re.split(r'[.!?]+', simplified) if len(s.strip()) > 10]
        key_points = sentences[:3] if len(sentences) >= 3 else sentences

        # Format simplified text cleanly
        simplified_paragraphs = [s + "." for s in sentences[:6]]
        final_text = " ".join(simplified_paragraphs) if simplified_paragraphs else simplified

        return SimplifyResponse(
            original_text=clean_input,
            simplified_text=final_text,
            key_points=key_points,
            reading_level="Plain English (Grade 6-8)",
        )

    async def chat_guidance(self, message: str, context: Optional[str] = None) -> ChatResponse:
        """
        Provides conversational accessibility advice, explaining WCAG criteria,
        assistive modes, and recommendations.
        """
        msg_lower = message.lower().strip()

        if settings.GEMINI_API_KEY:
            try:
                llm_chat = await self._call_gemini_chat(message, context)
                if llm_chat:
                    return ChatResponse(
                        response=llm_chat.get("response", ""),
                        suggested_actions=llm_chat.get("suggested_actions", [])
                    )
            except Exception as e:
                print(f"[AI Engine] Gemini chat guidance failed, using fallback: {e}")

        # Rule-based contextual assistant responses
        if "contrast" in msg_lower:
            return ChatResponse(
                response="WCAG 2.1 Criterion 1.4.3 requires a minimum contrast ratio of 4.5:1 for regular text and 3:1 for large text (at least 18pt or 14pt bold). You can turn on 'High Contrast: Yellow on Black' in AccessAble AI for maximum legibility.",
                suggested_actions=["Toggle High Contrast Mode", "Run Color Contrast Audit", "Increase Font Size"]
            )
        elif "blind" in msg_lower or "screen reader" in msg_lower:
            return ChatResponse(
                response="Screen readers (such as NVDA, JAWS, or VoiceOver) convert digital text to speech or refreshable braille. AccessAble AI's Blind Mode provides semantic skip-to-content links, descriptive button labels, and built-in text-to-speech reading.",
                suggested_actions=["Activate Blind Mode", "Start Text-to-Speech", "View Keyboard Shortcuts"]
            )
        elif "head tracking" in msg_lower:
            return ChatResponse(
                response="Head Tracking Mode uses your webcam to track head movements directly in the browser with zero cloud uploads. Moving your head moves the pointer, and hovering over any button for a calibrated dwell time activates it automatically.",
                suggested_actions=["Activate Head Tracking Mode", "Calibrate Camera Dwell", "Adjust Pointer Sensitivity"]
            )
        elif "voice" in msg_lower or "speech" in msg_lower:
            return ChatResponse(
                response="Voice Control Mode allows complete hands-free navigation using natural spoken commands like 'go to scanner', 'scroll down', 'read screen', and 'increase text'. All commands also have visual and text keyboard alternatives.",
                suggested_actions=["Open Voice Commands", "View Voice Cheat Sheet", "Test Speech Synthesis"]
            )
        elif "motor" in msg_lower or "switch" in msg_lower:
            return ChatResponse(
                response="Motor Accessibility Mode provides enlarged 48px touch/click targets, full keyboard navigation with no traps, switch device scanning (Space/Enter), and dwell-click auto selection to eliminate mouse strain.",
                suggested_actions=["Enable Motor Accessibility Mode", "Configure Dwell Delay", "Enable Switch Navigation"]
            )
        elif "cognitive" in msg_lower or "dyslexia" in msg_lower:
            return ChatResponse(
                response="Cognitive Accessibility Mode applies OpenDyslexic typography, 1.85 line spacing, reading ruler guides, and AI text simplification to convert dense technical jargon into clear Plain English.",
                suggested_actions=["Enable Cognitive Mode", "Simplify Article Text", "Toggle Reading Ruler"]
            )
        elif "hearing" in msg_lower or "deaf" in msg_lower:
            return ChatResponse(
                response="Hearing Accessibility Mode replaces all audio alerts with high-visibility screen flashes, provides real-time speech-to-text captions, and ensures no platform task ever requires sound perception.",
                suggested_actions=["Enable Hearing Mode", "Toggle Visual Alerts", "Open Live Captions"]
            )
        else:
            return ChatResponse(
                response=f"AccessAble AI is ready to help you navigate comfortably. You can choose one of our 8 accessibility modes (Blind, Low Vision, Voice Control, Head Tracking, Motor, Cognitive, Hearing, Custom) or run a WCAG 2.1 compliance audit on any public website.",
                suggested_actions=["Explore Accessibility Modes", "Start Website Scan", "Open Accessibility Toolbar"]
            )

    async def _call_gemini_explain(
        self,
        rule_id: str,
        description: str,
        html_snippet: Optional[str],
        target_url: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        prompt = f"""You are an expert web accessibility consultant.
Explain this accessibility issue in simple, plain English:
Rule ID: {rule_id}
Description: {description}
HTML Snippet: {html_snippet or 'None'}
Target URL: {target_url or 'None'}

Return ONLY a JSON object with this exact structure:
{{
  "simple_explanation": "1-2 clear sentences in simple language",
  "why_it_matters": "Why this is critical for users",
  "impact_by_disability": {{
    "blind": "Impact on blind screen-reader users",
    "low_vision": "Impact on low-vision or colorblind users",
    "motor": "Impact on motor or keyboard users",
    "cognitive": "Impact on cognitive, reading, or elderly users"
  }}
}}"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = text.strip().removeprefix("```json").removesuffix("```").strip()
                return json.loads(clean_json)
        return None

    async def _call_gemini_fix(
        self,
        rule_id: str,
        html_snippet: str,
        description: Optional[str],
        selector: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        prompt = f"""You are an expert accessibility engineer.
Given this inaccessible HTML snippet:
{html_snippet}
Rule ID: {rule_id}
Selector: {selector or 'None'}

Provide an accessible replacement following WCAG 2.1 AA standards.
Return ONLY a valid JSON object:
{{
  "suggested_snippet": "The corrected, accessible HTML snippet",
  "css_suggestion": "Optional CSS snippet or null",
  "alt_text_suggestion": "Optional alt text or null",
  "explanation_of_fix": "Clear explanation of changes made",
  "verification_instructions": "Step-by-step test instructions"
}}"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = text.strip().removeprefix("```json").removesuffix("```").strip()
                return json.loads(clean_json)
        return None

    async def _call_gemini_simplify(self, text: str, level: str) -> Optional[Dict[str, Any]]:
        prompt = f"""You are an expert cognitive accessibility and Plain English specialist.
Simplify the following text for people with cognitive disabilities, reading difficulties, or attention differences.
Rules:
1. Preserve the original core factual meaning.
2. Replace dense jargon with simple, active everyday language.
3. Extract 3 concise key takeaways.
4. Keep sentences under 15 words where possible.
5. Do NOT silently alter legal, medical, or financial facts.

Input text:
\"\"\"{text}\"\"\"

Return ONLY a JSON object:
{{
  "simplified_text": "Plain English simplified version",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "reading_level": "Plain English (Grade 6-8)"
}}"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = text.strip().removeprefix("```json").removesuffix("```").strip()
                return json.loads(clean_json)
        return None

    async def _call_gemini_chat(self, message: str, context: Optional[str]) -> Optional[Dict[str, Any]]:
        prompt = f"""You are AccessAble AI's expert digital accessibility consultant.
User question: \"\"\"{message}\"\"\"
Context: \"\"\"{context or 'None'}\"\"\"

Provide an encouraging, accurate, simple English explanation following WCAG 2.1 AA criteria.
Return ONLY a JSON object:
{{
  "response": "Helpful, concise answer",
  "suggested_actions": ["Action 1", "Action 2"]
}}"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = text.strip().removeprefix("```json").removesuffix("```").strip()
                return json.loads(clean_json)
        return None

ai_engine = AiRemediationEngine()
