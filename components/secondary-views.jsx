"use client";

import { useMemo, useState } from "react";

function severityClass(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function WorkspaceHeader({ code, title, description, children, id }) {
  return (
    <header className="workspace-header">
      <div><span className="page-code">{code}</span><h1 id={id}>{title}</h1><p>{description}</p></div>
      {children}
    </header>
  );
}

export function DetectionsView({ active, state, query, onQueryChange, onCommand, addToast }) {
  const [filter, setFilter] = useState("all");
  const visible = useMemo(() => state.detections.filter((item) => {
    const matchesType = filter === "all" || item.kind === filter;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || `${item.id} ${item.location} ${item.label}`.toLowerCase().includes(normalizedQuery);
    return matchesType && matchesQuery;
  }), [filter, query, state.detections]);
  const unverified = state.detections.filter((item) => ["Unverified", "Probable"].includes(item.verification)).length;

  return (
    <section className={`page workspace-page ${active ? "active" : ""}`} id="detectionsPage" aria-labelledby="detectionsTitle" aria-hidden={!active}>
      <WorkspaceHeader code="02 / INTELLIGENCE" title="DETECTIONS" description="Review, verify, and route actionable field intelligence." id="detectionsTitle">
        <div className="workspace-stats"><div><span>UNVERIFIED</span><strong>{String(unverified).padStart(2, "0")}</strong></div><div><span>CRITICAL</span><strong>01</strong></div><div><span>TEAMS ACTIVE</span><strong>02</strong></div></div>
      </WorkspaceHeader>
      <div className="filter-bar">
        <div className="segmented detection-filter">
          {[["all", "ALL 05"], ["survivor", "SURVIVORS 03"], ["hazard", "HAZARDS 02"]].map(([id, label]) => <button key={id} type="button" className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}
        </div>
        <label className="search-field"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input type="search" placeholder="Search ID or location" value={query} onChange={(event) => onQueryChange(event.target.value)} /></label>
      </div>
      <div className="detection-layout">
        <div className="detection-table-wrap panel">
          <table className="detection-table">
            <thead><tr><th>Detection</th><th>Type / condition</th><th>Location</th><th>Confidence</th><th>Priority</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className={item.verification === "Rejected" ? "is-rejected" : ""}>
                  <td><div className="detection-id-cell"><div className={`detection-thumb ${item.kind === "hazard" ? "hazard" : ""}`}/><div><strong>{item.id}</strong><span>{item.observedAt}</span></div></div></td>
                  <td><div className="type-cell"><strong>{item.label}</strong><span>{item.condition}</span></div></td>
                  <td><div className="type-cell"><strong>{item.location}</strong><span>{item.coordinates}</span></div></td>
                  <td><div className="confidence">{item.confidence}%<i><b style={{ width: `${item.confidence}%` }}/></i></div></td>
                  <td><span className={`severity-badge ${severityClass(item.priority)}`}>{item.priority.toUpperCase()}</span></td>
                  <td><span className={`status-pill ${severityClass(item.verification)}`}>{item.verification}</span></td>
                  <td><div className="table-actions"><button className="confirm" type="button" onClick={() => onCommand("VERIFY_DETECTION", { id: item.id, status: "Confirmed" }, "DETECTION CONFIRMED")} aria-label={`Confirm ${item.id}`}>✓</button><button className="reject" type="button" onClick={() => onCommand("VERIFY_DETECTION", { id: item.id, status: "Rejected" }, "DETECTION REJECTED")} aria-label={`Reject ${item.id}`}>×</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="panel response-panel">
          <span className="page-code">GROUND RESPONSE</span><h2>RESCUE TEAMS</h2>
          <div className="team-list">
            <article><i className="team-symbol">A</i><div><strong>ALPHA MEDICAL</strong><span>En route · SV-017</span></div><b>04:12</b></article>
            <article><i className="team-symbol">B</i><div><strong>BRAVO RAPID</strong><span>Available · North staging</span></div><b className="available">READY</b></article>
            <article><i className="team-symbol muted">C</i><div><strong>CHARLIE FIRE</strong><span>On site · HZ-009</span></div><b>12:48</b></article>
          </div>
          <div className="recommendation-card"><span>RECOMMENDED ASSIGNMENT</span><strong>Bravo Rapid → SV-021</strong><p>Route B · 1.4 km · low hazard exposure</p><button type="button" onClick={() => addToast("HUMAN CONFIRMATION REQUIRED", "Bravo Rapid recommendation opened for operator approval.")}>REVIEW & ASSIGN</button></div>
        </aside>
      </div>
    </section>
  );
}

export function MissionPlanningView({ active, addToast }) {
  const [altitude, setAltitude] = useState(84);
  const [velocity, setVelocity] = useState(8);
  return (
    <section className={`page workspace-page ${active ? "active" : ""}`} id="planningPage" aria-labelledby="planningTitle" aria-hidden={!active}>
      <WorkspaceHeader code="03 / MISSION DESIGN" title="MISSION PLANNING" description="Define the survey envelope, flight profile, and safety policy." id="planningTitle">
        <button className="primary-action compact" type="button" onClick={() => addToast("ROUTE GENERATED", "28 waypoints · 10.6 km² · estimated flight time 31 minutes.")}>GENERATE SURVEY ROUTE</button>
      </WorkspaceHeader>
      <div className="planning-layout">
        <section className="panel planning-map">
          <div className="planning-canvas">
            <svg viewBox="0 0 760 520" aria-label="Mission boundary editor">
              <defs><pattern id="planGrid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#879088" strokeOpacity=".23"/></pattern></defs>
              <rect width="760" height="520" fill="#d7d8cf"/><rect width="760" height="520" fill="url(#planGrid)"/><path className="river" d="M330-20c78 87 21 151-8 226-24 61 7 130 48 177 43 50 20 105-15 162"/><path className="mission-boundary plan-boundary" d="M95 78 625 54 700 401 522 468 113 435 58 230Z"/><path className="planned-route plan-route" d="M102 403 100 112 206 100 216 433 325 447 318 88 432 76 447 449 558 431 547 68 643 63 682 398"/><g className="boundary-handles"><circle cx="95" cy="78" r="8"/><circle cx="625" cy="54" r="8"/><circle cx="700" cy="401" r="8"/><circle cx="522" cy="468" r="8"/><circle cx="113" cy="435" r="8"/><circle cx="58" cy="230" r="8"/></g>
            </svg>
            <div className="drawing-tools"><button className="active" type="button">⌁</button><button type="button">＋</button><button type="button">⌖</button><button type="button">↶</button></div><span className="planning-area">BOUNDARY AREA <strong>10.6 KM²</strong></span>
          </div>
        </section>
        <aside className="planning-form">
          <section className="panel settings-card">
            <header><span>FLIGHT PROFILE</span><b>01</b></header>
            <label>Survey altitude<div><input type="range" min="30" max="120" value={altitude} onChange={(event) => setAltitude(event.target.value)}/><output>{altitude} M</output></div></label>
            <label>Cruise velocity<div><input type="range" min="2" max="15" value={velocity} onChange={(event) => setVelocity(event.target.value)}/><output>{velocity} M/S</output></div></label>
            <div className="field-row"><label>Pattern<select defaultValue="Lawnmower"><option>Lawnmower</option><option>Spiral</option><option>Perimeter</option></select></label><label>Overlap<select defaultValue="30%"><option>30%</option><option>40%</option><option>50%</option></select></label></div>
          </section>
          <section className="panel settings-card">
            <header><span>COLLISION SAFETY</span><b>02</b></header>
            <div className="selected-method"><i>ƒ</i><div><span>ACTIVE SAFETY FILTER</span><strong>VELOCITY-BASED CBF</strong></div><em>ACTIVE</em></div>
            <div className="field-row"><label>Safety radius<input defaultValue="6.0 m"/></label><label>Class-𝒦 α<input defaultValue="1.2"/></label></div>
            <label className="toggle-row"><span>Dynamic obstacle prediction<small>Apply relative velocity to CBF constraint</small></span><input type="checkbox" defaultChecked/></label>
            <label className="toggle-row"><span>Geofence as barrier<small>Keep all commanded velocities viable</small></span><input type="checkbox" defaultChecked/></label>
          </section>
          <section className="panel settings-card compact-settings"><header><span>FAILSAFES</span><b>03</b></header><div className="failsafe-line"><span>Link loss</span><strong>Return to home</strong></div><div className="failsafe-line"><span>Battery reserve</span><strong>25%</strong></div><div className="failsafe-line"><span>Localization loss</span><strong>Hold → RTH</strong></div></section>
        </aside>
      </div>
    </section>
  );
}

function HealthCard({ title, index, children, className = "" }) {
  return <section className={`panel health-card ${className}`}><header><span>{title}</span><i>{index}</i></header>{children}</section>;
}

export function DroneHealthView({ active, state }) {
  return (
    <section className={`page workspace-page ${active ? "active" : ""}`} id="healthPage" aria-labelledby="healthTitle" aria-hidden={!active}>
      <WorkspaceHeader code="04 / SYSTEMS" title="DRONE HEALTH" description="Flight stack, localization, communications, and edge-AI status." id="healthTitle"><span className="overall-health"><i/> ALL PRIMARY SYSTEMS NOMINAL</span></WorkspaceHeader>
      <div className="health-grid">
        <HealthCard title="POWER SYSTEM" index="01" className="battery-health"><div className="radial-gauge"><strong>72<small>%</small></strong><span>18:42 REMAINING</span></div><dl><div><dt>Voltage</dt><dd>22.4 V</dd></div><div><dt>Draw</dt><dd>18.6 A</dd></div><div><dt>Cells</dt><dd>6 / balanced</dd></div><div><dt>Reserve RTH</dt><dd>25%</dd></div></dl></HealthCard>
        <HealthCard title="NAVIGATION" index="02"><div className="health-status"><b><i/>RELIABLE</b><span>GPS + VISUAL-INERTIAL</span></div><dl><div><dt>GPS</dt><dd className="good-text">3D fix · 18 sats</dd></div><div><dt>Accuracy</dt><dd>± 0.8 m</dd></div><div><dt>SLAM</dt><dd className="good-text">Tracking</dd></div><div><dt>Visual odometry</dt><dd className="good-text">Active</dd></div><div><dt>LiDAR</dt><dd className="good-text">Active · 20 Hz</dd></div><div><dt>IMU / Compass</dt><dd className="good-text">Nominal</dd></div></dl></HealthCard>
        <HealthCard title="TELEMETRY MESH" index="03"><div className="signal-chart"><i style={{height:"30%"}}/><i style={{height:"45%"}}/><i style={{height:"62%"}}/><i style={{height:"78%"}}/><i style={{height:`${state.communication.linkQualityPercent}%`}}/><strong>{state.communication.signalDbm} dBm</strong></div><dl><div><dt>Primary link</dt><dd className="good-text">{state.communication.networkType}</dd></div><div><dt>Mesh quality</dt><dd>{state.communication.linkQualityPercent}%</dd></div><div><dt>Command latency</dt><dd>{state.communication.telemetryLatencyMs} ms</dd></div><div><dt>Gateway route</dt><dd>SITL → backend</dd></div><div><dt>Last packet</dt><dd>{(state.communication.lastCommunicationMs / 1000).toFixed(1)} s ago</dd></div></dl></HealthCard>
        <HealthCard title="EDGE AI" index="04"><div className="health-status"><b><i/>INFERENCE ACTIVE</b><span>YOLOv8-S + THERMAL FUSION</span></div><dl><div><dt>Inference rate</dt><dd>27.8 FPS</dd></div><div><dt>Latency</dt><dd>31 ms</dd></div><div><dt>GPU / NPU</dt><dd>62% / 48%</dd></div><div><dt>Temperature</dt><dd>67°C</dd></div><div><dt>Memory</dt><dd>4.2 / 8 GB</dd></div><div><dt>Last inference</dt><dd className="good-text">36 ms ago</dd></div></dl></HealthCard>
        <HealthCard title="ACTUATION & PAYLOAD" index="05" className="wide-card"><div className="motor-grid"><div><b>M1</b><span>4,812 RPM</span><i/></div><div><b>M2</b><span>4,796 RPM</span><i/></div><div><b>M3</b><span>4,825 RPM</span><i/></div><div><b>M4</b><span>4,804 RPM</span><i/></div></div><dl><div><dt>ESC health</dt><dd className="good-text">4 / 4 nominal</dd></div><div><dt>Payload</dt><dd>1.84 kg</dd></div><div><dt>RGB camera</dt><dd className="good-text">Online</dd></div><div><dt>Thermal camera</dt><dd className="good-text">Online</dd></div><div><dt>Gimbal</dt><dd className="good-text">Tracking</dd></div></dl></HealthCard>
      </div>
    </section>
  );
}

export function ReportsView({ active, onExportCsv, onExportJson, onPrint }) {
  return (
    <section className={`page workspace-page ${active ? "active" : ""}`} id="reportsPage" aria-labelledby="reportsTitle" aria-hidden={!active}>
      <WorkspaceHeader code="05 / ARCHIVE" title="REPORTS & HISTORY" description="Mission evidence, operational replay, and portable incident data." id="reportsTitle"><div className="report-actions"><button className="secondary-action compact" type="button" onClick={onExportCsv}>EXPORT CSV</button><button className="primary-action compact" type="button" onClick={onPrint}>SITUATION REPORT</button></div></WorkspaceHeader>
      <div className="reports-layout">
        <section className="panel current-report">
          <div className="report-cover"><span className="live-pip"><i/> CURRENT MISSION</span><h2>OPERATION<br/>VARUNA</h2><p>Flood response · River District 07</p><div className="report-summary-grid"><div><span>SURVEYED</span><strong>6.8 km²</strong></div><div><span>SURVIVORS</span><strong>03</strong></div><div><span>HAZARDS</span><strong>02</strong></div><div><span>LIMITATIONS</span><strong>01</strong></div></div><button type="button" onClick={onExportJson}>DOWNLOAD FULL MISSION JSON <span>↓</span></button></div>
          <div className="report-inclusions"><span>REPORT INCLUDES</span><ul><li>Mission summary and flight details</li><li>Survivor coordinates and evidence</li><li>Hazard impact assessment</li><li>Safe and blocked access routes</li><li>Uninspected areas and limitations</li></ul></div>
        </section>
        <section className="panel mission-history">
          <header><div><span className="page-code">LOCAL ARCHIVE</span><h2>PREVIOUS MISSIONS</h2></div><label className="search-field"><input type="search" placeholder="Search missions"/></label></header>
          <div className="history-list">
            <article><div className="history-date"><strong>28</strong><span>AUG<br/>2026</span></div><div><span>FLD-041</span><strong>OPERATION NADI</strong><small>Flood · Sector 04 · 01:12:43</small></div><div className="history-outcome"><b>COMPLETED</b><span>4 survivors · 3 hazards</span></div><button type="button">OPEN REPLAY →</button></article>
            <article><div className="history-date"><strong>24</strong><span>AUG<br/>2026</span></div><div><span>FIR-016</span><strong>OPERATION AGNI</strong><small>Wildfire · Forest Block C · 00:48:21</small></div><div className="history-outcome"><b>COMPLETED</b><span>1 survivor · 6 hazards</span></div><button type="button">OPEN REPLAY →</button></article>
            <article><div className="history-date"><strong>19</strong><span>AUG<br/>2026</span></div><div><span>LSL-008</span><strong>OPERATION SHILA</strong><small>Landslide · Ridge 12 · 00:34:09</small></div><div className="history-outcome warning"><b>LIMITED</b><span>GPS-degraded sector</span></div><button type="button">OPEN REPLAY →</button></article>
          </div>
        </section>
      </div>
    </section>
  );
}
