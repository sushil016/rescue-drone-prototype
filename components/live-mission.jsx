"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function formatDuration(totalSeconds) {
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds / 60) % 60).toString().padStart(2, "0");
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function severityClass(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function markerClass(item) {
  if (item.kind === "survivor") {
    if (item.severity === "Critical") return "critical";
    if (item.verification === "Confirmed") return "survivor";
    return "probable";
  }
  return item.label.toLowerCase().includes("fire") ? "fire" : "flood";
}

function markerGlyph(item) {
  if (item.kind === "survivor") return item.people > 1 ? String(item.people) : "+";
  return "!";
}

function SectionHeading({ index, title, subtitle, id }) {
  return (
    <div>
      <span className="section-index">{index}</span>
      <div><h2 id={id}>{title}</h2><p>{subtitle}</p></div>
    </div>
  );
}

function MissionSummary({ state }) {
  const { mission, vehicle, communication } = state;
  const stateLabel = mission.paused ? `${mission.state.toUpperCase()} · HOLD` : mission.state.toUpperCase();
  const criticalAlerts = state.alerts.filter((item) => item.priority === "Critical" && !item.acknowledged).length;
  return (
    <div className="mission-strip">
      <div className="mission-title-block">
        <span className="live-pip"><i/> LIVE OPERATION</span>
        <div>
          <h1 id="missionTitle">OPERATION VARUNA</h1>
          <span>FLD-042 / RIVER DISTRICT 07</span>
        </div>
      </div>
      <div className="strip-metrics" aria-label="Mission summary">
        <div className="strip-metric"><span>MISSION STATE</span><strong id="missionState"><i className={`status-dot ${mission.state === "Emergency" ? "" : "good"}`}/> {stateLabel}</strong></div>
        <div className="strip-metric"><span>ELAPSED</span><strong>{formatDuration(mission.elapsedSeconds)}</strong></div>
        <div className="strip-metric"><span>SURVEYED</span><strong><b>{Math.round(mission.surveyedPercent)}</b><small>%</small></strong></div>
        <div className="strip-metric"><span>GPS / LINK</span><strong><i className="status-dot good"/> 3D FIX · {communication.networkType === "Telemetry mesh" ? "MESH" : communication.networkType.toUpperCase()}</strong></div>
        <div className="strip-metric battery-metric">
          <span>BATTERY</span><strong><b>{Math.floor(vehicle.batteryPercent)}</b><small>%</small></strong>
          <i className="micro-bar"><b style={{ width: `${vehicle.batteryPercent}%` }}/></i>
        </div>
        <div className="strip-metric alert-metric"><span>CRITICAL ALERTS</span><strong>{String(criticalAlerts).padStart(2, "0")}</strong></div>
      </div>
    </div>
  );
}

function MissionMap({ state, selectedId, onSelect, onInspect, addToast }) {
  const [legendOpen, setLegendOpen] = useState(true);
  const [mapZoom, setMapZoom] = useState(1);
  const stageRef = useRef(null);
  const selected = useMemo(() => state.detections.find((item) => item.id === selectedId), [selectedId, state.detections]);
  const vehicle = state.vehicle;

  const expandMap = async () => {
    try {
      if (!document.fullscreenElement) await stageRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      addToast("FULLSCREEN UNAVAILABLE", "This browser blocked the fullscreen request.", true);
    }
  };

  return (
    <section className="panel map-panel" aria-labelledby="mapHeading">
      <header className="panel-header map-header">
        <SectionHeading index="01" title="LIVE DISASTER MAP" subtitle="River District 07 · flood response" id="mapHeading" />
        <div className="map-toolbar">
          <span className="coordinate-readout">{vehicle.position.lat.toFixed(4)}°N / {vehicle.position.lng.toFixed(4)}°E</span>
          <button className={`tool-button ${legendOpen ? "active" : ""}`} type="button" aria-pressed={legendOpen} onClick={() => setLegendOpen((current) => !current)}>
            <svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/></svg>Layers
          </button>
          <button className="square-button" type="button" aria-label="Expand map" onClick={expandMap}>
            <svg viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>
          </button>
        </div>
      </header>

      <div className="map-stage" ref={stageRef}>
        <svg className="mission-map" style={{ transform: `scale(${mapZoom})` }} viewBox="0 0 1000 620" role="img" aria-label="Drone mission map showing a flood response survey route">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#303a34" strokeOpacity=".14" strokeWidth="1"/></pattern>
            <pattern id="surveyHatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(42)"><rect width="14" height="14" fill="#819682" fillOpacity=".13"/><path d="M0 0V14" stroke="#829b86" strokeOpacity=".28" strokeWidth="4"/></pattern>
            <filter id="mapShadow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#131713" floodOpacity=".25"/></filter>
            <marker id="arrowSafe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="#2d7160"/></marker>
            <marker id="arrowDesired" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="#d85a3e"/></marker>
          </defs>
          <rect width="1000" height="620" fill="#d9d9cf"/><rect width="1000" height="620" fill="url(#grid)"/>
          <g className="topography" fill="none" stroke="#7e877f" strokeWidth="1.3" opacity=".31">
            <path d="M-40 112c108-76 198-58 278-2s167 54 258-1 182-63 274-11 170 46 282 0"/><path d="M-44 138c112-76 202-58 282-2s167 54 258-1 182-63 274-11 170 46 282 0"/><path d="M-38 505c93-45 154-31 219 11s144 44 229-3 179-54 267-8 180 55 341-10"/><path d="M-38 531c93-45 154-31 219 11s144 44 229-3 179-54 267-8 180 55 341-10"/><path d="M665-30c-55 97-36 170 9 230s50 125 3 203-50 147 0 248"/><path d="M690-30c-55 97-36 170 9 230s50 125 3 203-50 147 0 248"/>
          </g>
          <g className="map-buildings" fill="#b8bab1" stroke="#858b84" strokeWidth="1">
            <path d="M96 82h94v62H96zM214 58h49v88h-49zM300 73h105v54H300z"/><path d="M740 76h85v55h-85zM845 88h74v90h-74zM790 154h40v48h-40z"/><path d="M85 402h70v94H85zM172 426h91v51h-91zM270 470h58v66h-58z"/><path d="M760 421h115v57H760zM844 496h67v66h-67zM688 500h95v43h-95z"/>
          </g>
          <path className="river" d="M410-30c52 88 24 145-5 213-25 59-24 110 14 170 45 70 24 152-4 204-17 31-25 61-22 93"/>
          <path className="road" d="M-30 328C147 302 257 305 390 333s311 48 640-8"/><path className="road minor" d="M580-20c-7 87 2 174 30 259s30 190 8 408"/>
          <path className="mission-boundary" d="M112 110 860 80 916 505 700 562 128 530 76 290Z"/><path className="surveyed-zone" d="M112 110 470 96 490 543 128 530 76 290Z" fill="url(#surveyHatch)"/>
          <path className="flood-zone" d="M349 16c91 85 68 150 28 218-44 76-30 157 18 213 42 49 28 107-18 178l117 18c47-83 57-162 15-235-41-72-48-122-7-207 35-72 21-141-54-219Z"/>
          <path className="no-fly-zone" d="M714 120 835 142 822 256 680 238Z"/><text className="zone-label" x="751" y="193">NO-FLY</text><text className="zone-label flood-label" x="405" y="287" transform="rotate(-83 405 287)">FLOOD CHANNEL</text>
          <path className="safe-route" d="M98 475c82-46 152-70 238-62 105 10 194 59 302 50 84-7 132-58 220-49" markerEnd="url(#arrowSafe)"/><path className="blocked-route" d="M547 358c65 2 112-2 175-27"/>
          <g className="blocked-crosses"><path d="m590 345 14 14m0-14-14 14M631 339l14 14m0-14-14 14M672 329l14 14m0-14-14 14"/></g>
          <path className="planned-route" d="M155 490 158 160 292 145 305 495 449 480 446 132 590 119 604 465 744 444 736 105 851 97 860 472"/><path className="travelled-route" d="M155 490 158 160 292 145 305 495 449 480 446 132 590 119 604 465 744 444"/>
          <g className="home-marker" transform="translate(155 490)" filter="url(#mapShadow)"><path d="M-17 1 0-14 17 1v18H5V7H-5v12h-12Z"/><text x="25" y="6">HOME / LZ-01</text></g>
          <g className="landing-marker" transform="translate(880 508)"><circle r="17"/><text x="-6" y="6">H</text><text className="landing-label" x="26" y="5">ALT LZ-02</text></g>

          <g id="mapMarkers">
            {state.detections.filter((item) => item.verification !== "Rejected").map((item) => (
              <g
                key={item.id}
                className={`map-marker ${markerClass(item)} ${selectedId === item.id ? "selected" : ""}`}
                transform={`translate(${item.mapX} ${item.mapY})`}
                tabIndex="0"
                role="button"
                aria-label={`${item.id} ${item.label}`}
                onClick={() => onSelect(item.id)}
                onKeyDown={(event) => {
                  if (["Enter", " "].includes(event.key)) { event.preventDefault(); onSelect(item.id); }
                }}
              >
                <circle className="pulse-ring" r="14"/><path className="marker-pin" d="M0-16c-10 0-17 7-17 16 0 12 17 26 17 26S17 12 17 0C17-9 10-16 0-16Z"/><text className="marker-glyph" x="0" y="5" textAnchor="middle">{markerGlyph(item)}</text>
              </g>
            ))}
          </g>

          <g className="drone-cluster" transform={`translate(${vehicle.position.mapX.toFixed(1)} ${vehicle.position.mapY.toFixed(1)})`}>
            <circle className="gps-radius" r={34 + vehicle.gpsAccuracyM * 10}/><line className="velocity desired" x1="0" y1="0" x2="62" y2="-28" markerEnd="url(#arrowDesired)"/><line className="velocity safe" x1="0" y1="0" x2="24" y2="-55" markerEnd="url(#arrowSafe)"/>
            <g className="drone-marker" transform={`rotate(${vehicle.headingDeg.toFixed(1)})`} filter="url(#mapShadow)"><circle r="17"/><path d="M-17-17 17 17M17-17-17 17M-21-21h8v8h-8zM13-21h8v8h-8zM-21 13h8v8h-8zM13 13h8v8h-8zM-4-9 0-17 4-9Z"/></g>
            <g className="drone-label" transform="translate(28 -33)"><rect width="106" height="31" rx="2"/><text x="10" y="20">DR-01 · ACTIVE</text></g>
          </g>
        </svg>

        <div className="map-scale"><i/><span>200 M</span></div><div className="north-indicator"><span>N</span><i/></div>
        <div className="map-zoom" aria-label="Map zoom controls"><button type="button" aria-label="Zoom in" onClick={() => setMapZoom((current) => Math.min(1.45, current + 0.1))}>+</button><button type="button" aria-label="Zoom out" onClick={() => setMapZoom((current) => Math.max(0.8, current - 0.1))}>−</button></div>

        <div className={`map-legend ${legendOpen ? "" : "hidden"}`}>
          <div className="legend-title"><span>MAP KEY</span><button type="button" aria-label="Collapse legend" onClick={() => setLegendOpen(false)}>−</button></div>
          <div className="legend-grid"><span><i className="marker-dot survivor"/>Confirmed survivor</span><span><i className="marker-dot probable"/>Probable survivor</span><span><i className="marker-dot critical"/>Critical survivor</span><span><i className="marker-dot fire"/>Fire / smoke</span><span><i className="marker-dot flood"/>Floodwater</span><span><i className="marker-dot blocked"/>Blocked route</span></div>
        </div>

        <aside className={`marker-inspector ${selected ? "open" : ""}`} aria-live="polite">
          <button className="inspector-close" type="button" aria-label="Close marker details" onClick={() => onSelect(null)}>×</button>
          <div className="inspector-kicker">SELECTED DETECTION</div><div className={`inspector-visual ${selected?.kind === "hazard" ? "hazard" : "rgb-mini"}`}><span/></div>
          <div className="inspector-heading"><div><span>{selected?.kind?.toUpperCase() || "DETECTION"}</span><strong>{selected?.id || "—"}</strong></div><span className={`severity-badge ${severityClass(selected?.severity)}`}>{selected?.severity?.toUpperCase() || "—"}</span></div>
          <dl><div><dt>Coordinates</dt><dd>{selected?.coordinates || "—"}</dd></div><div><dt>Confidence</dt><dd>{selected ? `${selected.confidence}%` : "—"}</dd></div><div><dt>Observed</dt><dd>{selected?.observedAt || "—"}</dd></div><div><dt>Status</dt><dd>{selected?.responseStatus || "—"}</dd></div></dl>
          <button className="primary-action compact" type="button" disabled={!selected} onClick={() => selected && onInspect(selected.id)}>INVESTIGATE DETECTION</button>
        </aside>
      </div>

      <footer className="map-footer"><div><span>POSITION SOURCE</span><strong><i className="status-dot good"/> GPS + VISUAL-INERTIAL</strong></div><div><span>GPS ACCURACY</span><strong>± 0.8 M</strong></div><div><span>LAST UPDATE</span><strong>0.2 S AGO</strong></div><div><span>AREA REMAINING</span><strong>{state.mission.remainingAreaKm2.toFixed(1)} KM²</strong></div></footer>
    </section>
  );
}

function CameraFeed({ state, addToast }) {
  const [feedMode, setFeedMode] = useState("rgb");
  const [overlayOn, setOverlayOn] = useState(true);
  const [recording, setRecording] = useState(true);
  const [timestamp, setTimestamp] = useState("--:--:--.---");

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setTimestamp(`${now.toLocaleTimeString("en-GB", { hour12: false })}.${String(now.getMilliseconds()).padStart(3, "0")}`);
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="panel feed-panel" aria-labelledby="feedHeading">
      <header className="panel-header feed-header">
        <SectionHeading index="02" title="VISUAL FEED" subtitle="GIMBAL-01 / live stream" id="feedHeading" />
        <div className="segmented" role="tablist" aria-label="Camera feed">
          {[["rgb", "RGB"], ["thermal", "THERMAL"]].map(([id, label]) => <button key={id} type="button" className={feedMode === id ? "active" : ""} role="tab" aria-selected={feedMode === id} onClick={() => setFeedMode(id)}>{label}</button>)}
        </div>
      </header>
      <div className={`camera-viewport ${feedMode === "thermal" ? "thermal-mode" : "rgb-mode"} ${overlayOn ? "" : "overlay-off"}`}>
        <div className="camera-scene"><div className="horizon"/><div className="structure s-one"/><div className="structure s-two"/><div className="water-plane"/><div className="person p-one"/><div className="person p-two"/><div className="person p-three"/></div>
        <div className="thermal-scale"><span>42.3°</span><i/><span>18.1°</span></div>
        <div className="detection-box box-one"><span>PERSON 0.94</span></div><div className="detection-box box-two"><span>PERSON 0.87</span></div><div className="detection-box box-three"><span>PERSON 0.81</span></div>
        <div className="crosshair"><i/><b/></div>
        {recording ? <div className="recording"><i/> REC <span>00:04:18</span></div> : null}
        <div className="feed-meta top"><span>CAM 01</span><span>{feedMode === "thermal" ? "THERMAL / IR" : "RGB / 4K"}</span><span>30 FPS</span></div>
        <div className="feed-meta bottom"><span>ALT {state.vehicle.altitudeM.toFixed(1)} M</span><span>ZOOM 1.0×</span><span>{timestamp}</span></div>
        <div className="ai-badge"><i/> AI OVERLAY ON</div><div className="signal-interference"/>
      </div>
      <div className="feed-controls">
        <button type="button" onClick={() => addToast("EVIDENCE CAPTURED", `Snapshot tagged at ${state.vehicle.position.lat.toFixed(5)}, ${state.vehicle.position.lng.toFixed(5)}.`)}><svg viewBox="0 0 24 24"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg>CAPTURE</button>
        <button type="button" className={`record-control ${recording ? "" : "stopped"}`} onClick={() => { setRecording((current) => !current); addToast("VIDEO RECORDING", recording ? "Recording stopped and indexed locally." : "Recording resumed."); }}><i/><span>{recording ? "STOP REC" : "START REC"}</span></button>
        <button type="button" className={overlayOn ? "active" : ""} onClick={() => setOverlayOn((current) => !current)}><svg viewBox="0 0 24 24"><path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg>AI OVERLAY</button>
        <button type="button" onClick={() => addToast("GIMBAL CONTROL", "Drag control is staged for the live vehicle adapter.")}><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M6 6l12 12M18 6 6 18"/></svg>GIMBAL</button>
      </div>
    </section>
  );
}

function PriorityQueue({ state, onNavigate, onCommand, onConfirmCommand }) {
  const activeAlerts = state.alerts.filter((alert) => !alert.acknowledged);
  return (
    <section className="panel alerts-panel" aria-labelledby="alertsHeading">
      <header className="panel-header alerts-header">
        <SectionHeading index="03" title="PRIORITY QUEUE" subtitle={`${activeAlerts.length} active alerts`} id="alertsHeading" />
        <button className="text-button" type="button" onClick={() => onNavigate("detections")}>VIEW ALL <span>↗</span></button>
      </header>
      <div className="alert-list">
        {activeAlerts.length ? activeAlerts.map((alert, index) => (
          <article key={alert.id} className={`alert-item ${severityClass(alert.priority)}`} style={{ animationDelay: `${index * 45}ms` }}>
            <i className="alert-stripe"/><div className="alert-content"><div><span className="alert-priority">{alert.priority.toUpperCase()}</span><span className="alert-time">{alert.time}</span></div><strong>{alert.title}</strong><p>{alert.location} · {alert.action}</p></div>
            <div className="alert-actions">
              {alert.actionCommand === "DROP_MEDKIT" ? (
                <button
                  className="alert-action"
                  type="button"
                  disabled={state.payload.medkitsAvailable < 1}
                  onClick={() => onConfirmCommand("DROP_MEDKIT", {
                    alertId: alert.id,
                    targetId: alert.targetId,
                    coordinates: alert.coordinates,
                    medkitsAvailable: state.payload.medkitsAvailable,
                  })}
                >DROP MEDKIT</button>
              ) : null}
              <button type="button" onClick={() => onCommand("ACK_ALERT", { id: alert.id }, "ALERT ACKNOWLEDGED")}>ACK</button>
            </div>
          </article>
        )) : <div className="empty-state">NO ACTIVE ALERTS</div>}
      </div>
    </section>
  );
}

function MissionTimeline({ state }) {
  const mission = state.mission;
  return (
    <section className="panel timeline-panel" aria-labelledby="timelineHeading">
      <header className="panel-header timeline-header">
        <SectionHeading index="04" title="MISSION PROGRESS" subtitle="Live operational timeline" id="timelineHeading" />
        <div className="progress-label"><span>WAYPOINT {mission.currentWaypoint} / {mission.totalWaypoints}</span><strong>{Math.round(mission.surveyedPercent)}%</strong></div>
      </header>
      <div className="progress-track"><i style={{ width: `${mission.surveyedPercent}%` }}/><b style={{ left: `${mission.surveyedPercent}%` }}/></div>
      <div className="timeline-events">{state.timeline.slice(-5).map((event) => <article key={event.id} className={`timeline-event ${event.type}`}><span>{event.time}</span><strong>{event.title}</strong><small>{event.detail}</small></article>)}</div>
    </section>
  );
}

function FlightSafety({ state, onCommand, onConfirmCommand }) {
  const { vehicle, collisionAvoidance: cbf, mission } = state;
  const active = mission.state === "Surveying" && !mission.paused;
  return (
    <section className="panel telemetry-panel" aria-labelledby="telemetryHeading">
      <header className="panel-header telemetry-header"><SectionHeading index="05" title="FLIGHT & SAFETY" subtitle="DR-01 / velocity-CBF active" id="telemetryHeading"/><span className="system-badge"><i/> NOMINAL</span></header>
      <div className="telemetry-body">
        <div className="telemetry-grid"><div><span>ALTITUDE</span><strong>{vehicle.altitudeM.toFixed(1)} <small>M</small></strong><i className="trend up"/></div><div><span>GROUND SPEED</span><strong>{vehicle.groundSpeedMps.toFixed(1)} <small>M/S</small></strong><i className="sparkline"/></div><div><span>HEADING</span><strong>{Math.round(vehicle.headingDeg)}<small>°</small></strong><i className="heading-icon">↗</i></div><div><span>FLIGHT MODE</span><strong>{vehicle.flightMode}</strong><small className="subvalue">{vehicle.armed ? "ARMED" : "DISARMED"}</small></div></div>
        <div className="cbf-card">
          <div className="cbf-heading"><div><span>COLLISION AVOIDANCE</span><strong>VELOCITY-CBF FILTER</strong></div><span className={`cbf-status ${cbf.status === "Filtering" ? "intervening" : ""}`}><i/> {cbf.status.toUpperCase()}</span></div>
          <div className="cbf-visual">
            <svg viewBox="0 0 270 88" aria-label="Velocity safety filter visualization"><defs><marker id="smallOrangeArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="#d85a3e"/></marker><marker id="smallGreenArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="#2d7160"/></marker></defs><circle cx="212" cy="44" r="25" className="cbf-obstacle"/><circle cx="55" cy="44" r="8" className="cbf-drone"/><path d="M63 44h111" className="desired-vector" markerEnd="url(#smallOrangeArrow)"/><path d="M63 44c40 0 75-6 105-24" className="safe-vector" markerEnd="url(#smallGreenArrow)"/><path d="M180 8v72" className="barrier-line"/><text x="91" y="59">v_des</text><text x="112" y="23">v_safe</text><text x="187" y="82">h(x) ≥ 0</text></svg>
            <div className="cbf-metrics"><div><span>MIN. CLEARANCE</span><strong>{cbf.minimumClearanceM.toFixed(1)} M</strong></div><div><span>SAFETY MARGIN h(x)</span><strong>+ {cbf.barrierMargin.toFixed(1)}</strong></div><div><span>FILTER INTERVENTION</span><strong>{cbf.interventionPercent}%</strong></div></div>
          </div>
        </div>
      </div>
      <div className="mission-controls" aria-label="Mission controls">
        <button className="primary-action" type="button" disabled={active || ["Returning home", "Emergency", "Landing"].includes(mission.state)} onClick={() => onCommand(mission.paused ? "RESUME" : "START", {}, mission.paused ? "MISSION RESUMED" : "MISSION STARTED")}><i>▶</i><span>{mission.paused ? "RESUME MISSION" : active ? "MISSION ACTIVE" : "START MISSION"}</span></button>
        <button className="secondary-action" type="button" disabled={!active} onClick={() => onCommand("PAUSE", {}, "MISSION PAUSED")}><i>Ⅱ</i><span>PAUSE</span></button>
        <button className="secondary-action" type="button" onClick={() => onConfirmCommand("RETURN_HOME")}><i>↙</i><span>RETURN HOME</span></button>
        <button className="danger-action" type="button" onClick={() => onConfirmCommand("EMERGENCY_LAND")}><i>!</i><span>EMERGENCY LAND</span></button>
      </div>
    </section>
  );
}

const LOG_FILTERS = ["ALL", "FLIGHT", "NAV", "CBF", "AI", "COMMS", "COMMAND", "PAYLOAD"];

function DroneLogConsole({ state }) {
  const [filter, setFilter] = useState("ALL");
  const logs = filter === "ALL"
    ? state.droneLogs
    : state.droneLogs.filter((entry) => entry.source === filter);

  return (
    <section className="panel drone-log-panel" aria-labelledby="droneLogsHeading">
      <header className="panel-header drone-log-header">
        <SectionHeading index="06" title="DRONE LOG STREAM" subtitle={`Gazebo SITL · ${state.droneLogs.length} total entries`} id="droneLogsHeading" />
        <div className="log-link-status"><span><i/> TELEMETRY MESH</span><b>LIVE</b></div>
      </header>
      <div className="log-toolbar" aria-label="Drone log filters">
        {LOG_FILTERS.map((source) => (
          <button key={source} type="button" className={filter === source ? "active" : ""} onClick={() => setFilter(source)}>{source}</button>
        ))}
        <span>{logs.length} SHOWN</span>
      </div>
      <div className="drone-log-scroll">
        <table className="drone-log-table">
          <thead><tr><th>Timestamp</th><th>Source</th><th>Level</th><th>Event</th><th>Telemetry / detail</th></tr></thead>
          <tbody>
            {[...logs].reverse().map((entry) => (
              <tr key={entry.id}>
                <td><time>{entry.time}</time></td>
                <td><span className={`log-source source-${entry.source.toLowerCase()}`}>{entry.source}</span></td>
                <td><span className={`log-level level-${entry.level.toLowerCase()}`}>{entry.level.toUpperCase()}</span></td>
                <td><strong>{entry.message}</strong></td>
                <td>{entry.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="drone-log-footer"><span>SOURCE <strong>{state.connectionMode.replaceAll("_", " ")}</strong></span><span>ROUTE <strong>{state.communication.route}</strong></span><span>PAYLOAD <strong>{state.payload.medkitsAvailable} MEDKITS · {state.payload.bayStatus.toUpperCase()}</strong></span></footer>
    </section>
  );
}

export default function LiveMission({ active, state, selectedDetectionId, onSelectDetection, onInspectDetection, onNavigate, onCommand, onConfirmCommand, addToast }) {
  return (
    <section className={`page ${active ? "active" : ""}`} id="livePage" aria-labelledby="missionTitle" aria-hidden={!active}>
      <MissionSummary state={state}/>
      <div className="dashboard-grid">
        <MissionMap state={state} selectedId={selectedDetectionId} onSelect={onSelectDetection} onInspect={onInspectDetection} addToast={addToast}/>
        <aside className="right-stack"><CameraFeed state={state} addToast={addToast}/><PriorityQueue state={state} onNavigate={onNavigate} onCommand={onCommand} onConfirmCommand={onConfirmCommand}/></aside>
        <MissionTimeline state={state}/>
        <FlightSafety state={state} onCommand={onCommand} onConfirmCommand={onConfirmCommand}/>
      </div>
      <DroneLogConsole state={state}/>
    </section>
  );
}
