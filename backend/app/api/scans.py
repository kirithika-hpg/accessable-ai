import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.scan import ScanReport
from app.models.finding import AccessibilityFinding
from app.models.user import User
from app.schemas.scan import ScanCreateRequest, ScanStartResponse, ScanResponse
from app.core.security import get_current_user
from app.core.scanner import scanner_engine
from app.core.ssrf_validator import validate_target_url

router = APIRouter(prefix="/scans", tags=["Scans"])

async def run_scan_background(scan_id: str, target_url: str):
    """Executes the scan asynchronously and records findings into the database."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        report = db.query(ScanReport).filter(ScanReport.id == scan_id).first()
        if not report:
            return

        report.status = "scanning"
        db.commit()

        # Run automated evaluation
        results = await scanner_engine.scan_url(target_url)

        # Update scan report
        report.status = "completed"
        report.total_issues = results["total_issues"]
        report.critical_count = results["critical_count"]
        report.serious_count = results["serious_count"]
        report.moderate_count = results["moderate_count"]
        report.minor_count = results["minor_count"]
        report.accessibility_score = results["accessibility_score"]
        report.scan_duration_ms = results["scan_duration_ms"]

        # Insert findings
        for f in results["findings"]:
            finding_record = AccessibilityFinding(
                scan_id=scan_id,
                rule_id=f["rule_id"],
                rule_name=f["rule_name"],
                description=f["description"],
                severity=f["severity"],
                wcag_tags=json.dumps(f["wcag_tags"]),
                selector=f["selector"],
                html_snippet=f["html_snippet"],
                failure_summary=f["failure_summary"],
                recommended_fix=f["recommended_fix"],
                manual_test_notes=f["manual_test_notes"],
            )
            db.add(finding_record)

        db.commit()
    except Exception as e:
        report = db.query(ScanReport).filter(ScanReport.id == scan_id).first()
        if report:
            report.status = "failed"
            report.error_message = str(e)
            db.commit()
    finally:
        db.close()

@router.post("", response_model=ScanStartResponse, status_code=status.HTTP_202_ACCEPTED)
async def start_accessibility_scan(
    payload: ScanCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    # Security: URL validation & SSRF check
    is_valid, validated_url, err_msg = validate_target_url(payload.url)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security check blocked URL: {err_msg}"
        )

    scan_id = str(uuid.uuid4())
    user_id = current_user.id if current_user else None

    # Create scan record in pending state
    report = ScanReport(
        id=scan_id,
        user_id=user_id,
        target_url=validated_url,
        status="pending",
    )
    db.add(report)
    db.commit()

    # Launch background scan worker
    background_tasks.add_task(run_scan_background, scan_id, validated_url)

    return ScanStartResponse(
        scan_id=scan_id,
        target_url=validated_url,
        message="Accessibility scan initiated. Check status at /api/scans/{scan_id}."
    )

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(scan_id: str, db: Session = Depends(get_db)):
    report = db.query(ScanReport).filter(ScanReport.id == scan_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan report with ID '{scan_id}' was not found."
        )
    return report

@router.get("", response_model=List[ScanResponse])
def get_user_scans(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = db.query(ScanReport)
    if current_user:
        query = query.filter(ScanReport.user_id == current_user.id)
    return query.order_by(ScanReport.scanned_at.desc()).limit(50).all()

@router.delete("/{scan_id}")
def delete_scan_report(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    report = db.query(ScanReport).filter(ScanReport.id == scan_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan report with ID '{scan_id}' not found."
        )

    # If scan belongs to user, check permission
    if report.user_id and current_user and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this scan report."
        )

    db.delete(report)
    db.commit()
    return {"message": f"Scan report '{scan_id}' deleted successfully."}
