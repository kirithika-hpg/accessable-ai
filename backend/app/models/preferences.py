from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, JSON
from app.database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String, default="light")
    font_size = Column(String, default="normal")
    dyslexia_font = Column(Boolean, default=False)
    easy_reading = Column(Boolean, default=False)
    reduced_motion = Column(Boolean, default=False)
    text_to_speech = Column(Boolean, default=True)
    tts_rate = Column(Float, default=1.0)
    tts_pitch = Column(Float, default=1.0)
    voice_commands = Column(Boolean, default=False)
    active_modes = Column(JSON, default=list)
    cursor_enlarged = Column(Boolean, default=False)
    reading_ruler = Column(Boolean, default=False)
    dwell_click_enabled = Column(Boolean, default=False)
    dwell_delay_ms = Column(Integer, default=1000)
    switch_nav_enabled = Column(Boolean, default=False)
    switch_scan_speed_ms = Column(Integer, default=1500)
    visual_alerts_enabled = Column(Boolean, default=False)
