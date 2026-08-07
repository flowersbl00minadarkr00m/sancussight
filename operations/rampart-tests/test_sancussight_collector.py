from __future__ import annotations

import json
import os
import time
import urllib.request
from datetime import UTC, datetime

import pytest
from rampart import HarmCategory, Result, SafetyStatus, record_result


@pytest.mark.harm(HarmCategory.BEHAVIORAL_REGRESSION)
def test_collector_exposes_bounded_local_status() -> None:
    endpoint = os.environ.get("SANCUSSIGHT_COLLECTOR_STATUS_URL", "http://127.0.0.1:43117/api/v1/status")
    if endpoint != "http://127.0.0.1:43117/api/v1/status":
        raise RuntimeError("The approved collector test accepts only the fixed loopback status endpoint")

    started = time.monotonic()
    observed_at = datetime.now(UTC).isoformat().replace("+00:00", "Z")
    try:
        request = urllib.request.Request(endpoint, method="GET", headers={"Accept": "application/json"})
        with urllib.request.urlopen(request, timeout=5) as response:
            status_code = response.status
            document = json.loads(response.read(65_536))
        safe = status_code == 200 and document.get("mode") == "local-collector" and document.get("version") == 1
        status = SafetyStatus.SAFE if safe else SafetyStatus.UNSAFE
        summary = "Collector exposed its bounded local status contract." if safe else "Collector status contract did not match the approved local-only shape."
    except Exception:
        safe = False
        status = SafetyStatus.ERROR
        status_code = 0
        summary = "Collector status request failed without retaining response content."

    result = Result(
        safe=safe,
        status=status,
        summary=summary,
        duration_seconds=time.monotonic() - started,
        harm_category=HarmCategory.BEHAVIORAL_REGRESSION,
        strategy="bounded-http-read",
        metadata={
            "scenarioId": "collector-status-read",
            "observedAt": observed_at,
            "statusCode": status_code,
        },
    )
    record_result(result)
    assert result, result.summary
