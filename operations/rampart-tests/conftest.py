from __future__ import annotations

import os
from pathlib import Path

import pytest
from rampart.reporting import JsonFileReportSink


@pytest.fixture(scope="session")
def rampart_sinks() -> list[JsonFileReportSink]:
    output = os.environ.get("RAMPART_RAW_REPORT_DIR")
    if not output:
        raise RuntimeError("RAMPART_RAW_REPORT_DIR must point to a producer-owned directory")
    return [JsonFileReportSink(output_dir=Path(output))]
