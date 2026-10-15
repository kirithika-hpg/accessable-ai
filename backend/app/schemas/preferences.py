from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class PreferencesBase(BaseModel):
    theme: Optional[str] = "light"
    font_size: Optional[str] = "normal"
    dyslexia_font: Optional[bool] = False
    easy_reading: Optional[bool] = False
    reduced_motion: Optional[bool] = False
    text_to_speech: Optional[bool] = True
    tts_rate: Optional[float] = 1.0
    tts_pitch: Optional[float] = 1.0
    voice_commands: Optional[bool] = False
    active_modes: Optional[List[str]] = []
    cursor_enlarged: Optional[bool] = False
    reading_ruler: Optional[bool] = False
    dwell_click_enabled: Optional[bool] = False
    dwell_delay_ms: Optional[int] = 1000
    switch_nav_enabled: Optional[bool] = False
    switch_scan_speed_ms: Optional[int] = 1500
    visual_alerts_enabled: Optional[bool] = False

class PreferencesUpdate(PreferencesBase):
    pass

class PreferencesResponse(PreferencesBase):
    id: Optional[int] = None
    user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
