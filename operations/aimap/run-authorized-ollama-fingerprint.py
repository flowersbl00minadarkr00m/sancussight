"""Fixed-function AIMap adapter for the approved loopback Ollama fingerprint."""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import importlib.util
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

AI_MAP_COMMIT = "65c820cbdad3da449f49aedb70055ca5ed4fa0ce"
TARGET = {"host": "127.0.0.1", "port": 11434, "protocol": "http", "templates": ["ollama-fingerprint"]}
TEMPLATE_ID = "sancussight-authorized-ollama-fingerprint"

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_runner(path: Path):
    spec = importlib.util.spec_from_file_location("aimap_nuclei_runner", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the pinned AIMap Nuclei adapter.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.NucleiRunner

async def run(args: argparse.Namespace) -> None:
    release_run_id = os.environ.get("SANCUSSIGHT_RELEASE_RUN_ID", "")
    if not release_run_id or len(release_run_id) > 160 or not all(character.isalnum() or character in "._-" for character in release_run_id):
        raise RuntimeError("SANCUSSIGHT_RELEASE_RUN_ID must be a bounded release token")
    producer_root = Path(args.producer_root).resolve()
    output_root = Path(args.output_root).resolve()
    template = Path(args.template).resolve()
    expected_template = (Path(__file__).resolve().parent / "ollama-fingerprint.yaml").resolve()
    if template != expected_template or not template.is_file():
        raise RuntimeError("Only the reviewed Ollama fingerprint template is authorized.")
    runner_path = producer_root / "backend" / "app" / "discovery" / "nuclei_runner.py"
    nuclei_path = producer_root / "tools" / "nuclei.exe"
    if not runner_path.is_file() or not nuclei_path.is_file():
        raise RuntimeError("Pinned AIMap or Nuclei producer artifact is unavailable.")

    now = datetime.now(timezone.utc)
    valid_until = now + timedelta(hours=2)
    stamp = now.strftime("%Y%m%dT%H%M%SZ")
    authorization_id = f"sancussight-ollama-fingerprint-{stamp}"
    scan_id = f"aimap-ollama-{stamp}"
    run_dir = output_root / scan_id
    run_dir.mkdir(parents=True, exist_ok=False)
    authorization = {
        "schemaVersion": 1, "authorizationId": authorization_id, "owner": "local-operator",
        "purpose": "Spec 005 T9 fingerprint-only discovery of the operator-owned loopback Ollama endpoint",
        "target": TARGET, "validFrom": now.isoformat().replace("+00:00", "Z"),
        "validUntil": valid_until.isoformat().replace("+00:00", "Z"), "releaseRunId": release_run_id,
    }
    authorization_path = run_dir / "authorization.json"
    authorization_path.write_text(json.dumps(authorization, indent=2), encoding="utf-8")
    (run_dir / "targets.txt").write_text("http://127.0.0.1:11434\n", encoding="utf-8")

    NucleiRunner = load_runner(runner_path)
    runner = NucleiRunner(binary_path=str(nuclei_path), timeout=120)
    raw_path = run_dir / "nuclei.jsonl"
    findings = await runner.run_scan(str(run_dir / "targets.txt"), str(template.parent), str(raw_path), extra_args=["-disable-update-check", "-no-color"])
    matches = [item for item in findings if item.get("template-id") == TEMPLATE_ID]
    if not matches:
        raise RuntimeError("The authorized endpoint did not produce the required Ollama fingerprint.")
    normalized = runner.normalize_finding(matches[0])
    scan = {
        "schemaVersion": 1, "sourceVersion": AI_MAP_COMMIT, "scanId": scan_id,
        "authorizationId": authorization_id, "runId": release_run_id, "status": "completed",
        "target": TARGET, "completedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "findings": [{"findingId": f"{scan_id}-fingerprint", "endpointId": "loopback-ollama-11434",
            "hostname": "127.0.0.1", "port": 11434, "protocol": "http", "authStatus": "unauthenticated",
            "riskScore": 1.0, "riskFactors": ["operator-owned-loopback", "fingerprint-only"],
            "template": TEMPLATE_ID, "severity": "informational",
            "title": "Operator-owned loopback Ollama endpoint fingerprinted"}],
        "operational": {"qualification": "operational", "sourceVersion": AI_MAP_COMMIT,
            "runId": release_run_id, "targetId": "loopback-ollama-11434", "contractVersion": "aimap-v1"},
        "producer": {"adapter": "AIMap NucleiRunner", "adapterCommit": AI_MAP_COMMIT,
            "nucleiSha256": sha256(nuclei_path), "templateSha256": sha256(template),
            "normalizedProtocol": normalized.get("protocol", "unknown")},
    }
    (run_dir / "scan.json").write_text(json.dumps(scan, indent=2), encoding="utf-8")
    print(json.dumps({"runDirectory": str(run_dir), "authorization": str(authorization_path), "scan": str(run_dir / "scan.json")}))

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--producer-root", required=True)
    parser.add_argument("--output-root", required=True)
    parser.add_argument("--template", required=True)
    asyncio.run(run(parser.parse_args()))

if __name__ == "__main__":
    main()
