"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMockGateway,
  getInitialMissionState,
  TELEMETRY_CONTRACT,
} from "../src/telemetry-adapter";
import LiveMission from "./live-mission";
import {
  DetectionsView,
  DroneHealthView,
  MissionPlanningView,
  ReportsView,
} from "./secondary-views";

const NAV_ITEMS = [
  { id: "live", label: "Live mission", shortLabel: "Fly", icon: "fly" },
  { id: "detections", label: "Detections", shortLabel: "Detect", icon: "detect", badge: "05" },
  { id: "planning", label: "Mission planning", shortLabel: "Plan", icon: "plan" },
  { id: "health", label: "Drone health", shortLabel: "Vehicle", icon: "health" },
  { id: "reports", label: "Reports and history", shortLabel: "Reports", icon: "reports" },
];

function NavGlyph({ type }) {
  if (type === "fly") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 4 8 5 2-5 2-4 6-4-6-5-2 5-2 4-8Z"/><circle cx="12" cy="13" r="2"/></svg>;
  }
  if (type === "detect") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>;
  }
  if (type === "plan") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="18" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="18" cy="18" r="2"/><path d="M7 18h9M18 16V7M7 17 16 7"/></svg>;
  }
  if (type === "health") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6"/><path d="M4 4h16v16H4z"/></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"/></svg>;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><i/><i/><i/><i/><b/></span>;
}

function GcsRail({ page, onNavigate, soundOn, onToggleSound }) {
  return (
    <aside className="gcs-rail" aria-label="Ground control navigation">
      <button className="brand" type="button" onClick={() => onNavigate("live")} aria-label="Aegis rescue command">
        <BrandMark />
        <span className="brand-copy"><strong>AEGIS</strong><small>GCS</small></span>
      </button>
      <nav className="primary-nav" aria-label="Dashboard pages">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            aria-current={page === item.id ? "page" : undefined}
          >
            <NavGlyph type={item.icon} />
            <em>{item.shortLabel}</em>
            {item.badge ? <span>{item.badge}</span> : null}
          </button>
        ))}
      </nav>
      <div className="operator-block">
        <div>
          <span className="operator-avatar">O1</span>
          <span className="eyebrow"><i/>IN CONTROL</span>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Toggle alert sound"
          aria-pressed={soundOn}
          onClick={onToggleSound}
          style={{ opacity: soundOn ? 1 : 0.5 }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5Zm12.5-.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>
        </button>
      </div>
    </aside>
  );
}

function ConfirmationModal({ command, checked, onChecked, onCancel, onConfirm }) {
  if (!command) return null;
  const type = command.type;
  const payload = command.payload ?? {};
  const copy = {
    EMERGENCY_LAND: {
      icon: "!",
      code: "FLIGHT COMMAND",
      title: "EMERGENCY LAND DR-01?",
      body: "The aircraft will stop its active route and land at the nearest viable location. Confirm only if continued flight is unsafe.",
      check: "I understand the operational impact of this command.",
      confirm: "CONFIRM COMMAND",
    },
    RETURN_HOME: {
      icon: "↙",
      code: "FLIGHT COMMAND",
      title: "RETURN TO HOME?",
      body: "The active survey will stop and DR-01 will navigate to the designated home point at LZ-01.",
      check: "I understand the operational impact of this command.",
      confirm: "CONFIRM COMMAND",
    },
    DROP_MEDKIT: {
      icon: "+",
      code: "PAYLOAD COMMAND",
      title: "DROP MEDKIT AT GEOTAG?",
      body: `DR-01 will release one medkit at ${payload.coordinates ?? "the received coordinate"}. ${payload.medkitsAvailable ?? "Two"} medkits are currently available in the simulated payload bay.`,
      check: "I verified the geotag and confirmed the drop zone is clear.",
      confirm: "CONFIRM MEDKIT DROP",
    },
  }[type] ?? {
    icon: "!",
    code: "COMMAND CONFIRMATION",
    title: "CONFIRM COMMAND?",
    body: "Confirm this vehicle command before it is sent through the telemetry gateway.",
    check: "I understand the operational impact of this command.",
    confirm: "CONFIRM COMMAND",
  };
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirmationTitle" aria-describedby="confirmationBody">
        <div className={`modal-warning ${type === "DROP_MEDKIT" ? "payload" : ""}`}>{copy.icon}</div>
        <span className="page-code">{copy.code}</span>
        <h2 id="confirmationTitle">{copy.title}</h2>
        <p id="confirmationBody">{copy.body}</p>
        <label className="confirmation-check">
          <input type="checkbox" checked={checked} onChange={(event) => onChecked(event.target.checked)} />
          <span>{copy.check}</span>
        </label>
        <div>
          <button className="secondary-action" type="button" onClick={onCancel}>CANCEL</button>
          <button className={`danger-action ${type === "DROP_MEDKIT" ? "payload-confirm" : ""}`} type="button" disabled={!checked} onClick={onConfirm}>{copy.confirm}</button>
        </div>
      </section>
    </div>
  );
}

function csvFromDetections(detections) {
  const header = ["id", "kind", "label", "condition", "coordinates", "confidence", "priority", "verification", "observed_at", "response_status"];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = detections.map((item) => [
    item.id,
    item.kind,
    item.label,
    item.condition,
    item.coordinates,
    item.confidence,
    item.priority,
    item.verification,
    item.observedAt,
    item.responseStatus,
  ].map(escape).join(","));
  return [header.join(","), ...rows].join("\n");
}

export default function GcsDashboard() {
  const [state, setState] = useState(getInitialMissionState);
  const [page, setPage] = useState("live");
  const [soundOn, setSoundOn] = useState(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);
  const [detectionQuery, setDetectionQuery] = useState("");
  const [pendingCommand, setPendingCommand] = useState(null);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [toasts, setToasts] = useState([]);
  const gatewayRef = useRef(null);
  const toastTimers = useRef(new Set());

  useEffect(() => {
    const gateway = createMockGateway();
    gatewayRef.current = gateway;
    const unsubscribe = gateway.subscribe(setState);
    return () => {
      unsubscribe();
      gateway.destroy();
      gatewayRef.current = null;
    };
  }, []);

  useEffect(() => () => {
    toastTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setPendingCommand(null);
      setConfirmationChecked(false);
      setSelectedDetectionId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const addToast = useCallback((title, message, warning = false) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, warning }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      toastTimers.current.delete(timer);
    }, 4200);
    toastTimers.current.add(timer);
  }, []);

  const sendCommand = useCallback(async (type, payload = {}, successTitle = "COMMAND SENT") => {
    const response = await gatewayRef.current?.command(type, payload);
    if (!response) {
      addToast("COMMAND UNAVAILABLE", "The simulated vehicle gateway is not ready.", true);
      return null;
    }
    addToast(successTitle, response.reason, !response.accepted);
    return response;
  }, [addToast]);

  const navigate = useCallback((nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const inspectDetection = useCallback((id) => {
    setDetectionQuery(id);
    setPage("detections");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openConfirmation = useCallback((type, payload = {}) => {
    setPendingCommand({ type, payload });
    setConfirmationChecked(false);
  }, []);

  const closeConfirmation = useCallback(() => {
    setPendingCommand(null);
    setConfirmationChecked(false);
  }, []);

  const confirmCommand = useCallback(async () => {
    if (!pendingCommand || !confirmationChecked) return;
    const command = pendingCommand;
    closeConfirmation();
    await sendCommand(
      command.type,
      command.payload,
      {
        EMERGENCY_LAND: "EMERGENCY LANDING INITIATED",
        RETURN_HOME: "RETURN TO HOME INITIATED",
        DROP_MEDKIT: "MEDKIT DROP COMPLETED",
      }[command.type] ?? "COMMAND SENT",
    );
  }, [closeConfirmation, confirmationChecked, pendingCommand, sendCommand]);

  const download = useCallback((filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }, []);

  const exportCsv = useCallback(() => {
    download("FLD-042-detections.csv", csvFromDetections(state.detections), "text/csv;charset=utf-8");
    addToast("EXPORT READY", "Detection list saved as CSV.");
  }, [addToast, download, state.detections]);

  const exportJson = useCallback(() => {
    download(
      "FLD-042-mission.json",
      JSON.stringify({ contract: TELEMETRY_CONTRACT, ...state }, null, 2),
      "application/json",
    );
    addToast("EXPORT READY", "Full mission state saved as JSON.");
  }, [addToast, download, state]);

  return (
    <div className="app-shell">
      <div className="noise" aria-hidden="true" />
      <GcsRail
        page={page}
        onNavigate={navigate}
        soundOn={soundOn}
        onToggleSound={() => {
          setSoundOn((current) => {
            addToast("ALERT AUDIO", current ? "Critical alert audio muted." : "Critical alert audio enabled.");
            return !current;
          });
        }}
      />

      <main className="gcs-workspace">
        <LiveMission
          active={page === "live"}
          state={state}
          selectedDetectionId={selectedDetectionId}
          onSelectDetection={setSelectedDetectionId}
          onInspectDetection={inspectDetection}
          onNavigate={navigate}
          onCommand={sendCommand}
          onConfirmCommand={openConfirmation}
          addToast={addToast}
        />
        <DetectionsView
          active={page === "detections"}
          state={state}
          query={detectionQuery}
          onQueryChange={setDetectionQuery}
          onCommand={sendCommand}
          addToast={addToast}
        />
        <MissionPlanningView active={page === "planning"} addToast={addToast} />
        <DroneHealthView active={page === "health"} state={state} />
        <ReportsView
          active={page === "reports"}
          onExportCsv={exportCsv}
          onExportJson={exportJson}
          onPrint={() => window.print()}
        />
      </main>

      <ConfirmationModal
        command={pendingCommand}
        checked={confirmationChecked}
        onChecked={setConfirmationChecked}
        onCancel={closeConfirmation}
        onConfirm={confirmCommand}
      />

      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.warning ? "warning" : ""}`}>
            <strong>{toast.title}</strong>{toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
