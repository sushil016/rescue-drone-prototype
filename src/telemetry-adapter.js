/**
 * RoboNerve telemetry boundary
 * ----------------------------
 * The UI only consumes this normalized shape. Replace createMockGateway with a
 * ROSBridge, MAVLink, WebSocket, or REST adapter without changing the views.
 */
export const TELEMETRY_CONTRACT = Object.freeze({
  mission: {
    required: ["id", "name", "disasterType", "state", "elapsedSeconds", "surveyedPercent", "remainingAreaKm2"],
    states: ["Ready", "Taking off", "Surveying", "Investigating", "Returning home", "Landing", "Completed", "Emergency"],
  },
  vehicle: {
    required: ["position", "headingDeg", "altitudeM", "groundSpeedMps", "batteryPercent", "flightMode", "armed"],
  },
  collisionAvoidance: {
    method: "velocity-cbf",
    required: ["desiredVelocity", "safeVelocity", "minimumClearanceM", "barrierMargin", "interventionPercent", "status"],
  },
  communication: {
    transport: "telemetry-mesh",
    required: ["connected", "networkType", "signalDbm", "linkQualityPercent", "telemetryLatencyMs", "lastCommunicationMs"],
  },
  payload: {
    required: ["assetId", "medkitsAvailable", "bayStatus", "lastDrop"],
  },
  fleet: {
    required: ["id", "role", "status", "batteryPercent", "meshQualityPercent"],
  },
  medicalResponse: {
    required: ["caseId", "targetId", "triage", "status", "assignedAsset", "assignedTeam", "stages"],
  },
  droneLog: {
    required: ["id", "time", "source", "level", "message", "data"],
  },
  commandAcknowledgement: {
    required: ["commandId", "accepted", "vehicleTimestamp", "reason"],
  },
});

const routePoints = [
  [155, 490], [158, 160], [292, 145], [305, 495], [449, 480], [446, 132],
  [590, 119], [604, 465], [744, 444], [736, 105], [851, 97], [860, 472],
];

const initialState = {
  connectionMode: "GAZEBO_SITL",
  mission: {
    id: "FLD-042",
    name: "Operation Varuna",
    disasterType: "Flood",
    missionType: "Search + Medical Response",
    region: "River District 07",
    objective: "Detect, triage, assist, and hand over",
    startedAt: "14:09:34",
    state: "Surveying",
    paused: false,
    elapsedSeconds: 1122,
    surveyedPercent: 64,
    surveyedAreaKm2: 6.8,
    remainingAreaKm2: 3.8,
    currentWaypoint: 18,
    totalWaypoints: 28,
  },
  vehicle: {
    id: "DR-01",
    armed: true,
    flightMode: "AUTO",
    position: { lat: 26.9126, lng: 75.7873, mapX: 744, mapY: 444 },
    headingDeg: 127,
    altitudeM: 84.2,
    groundSpeedMps: 8.4,
    verticalSpeedMps: 0.2,
    batteryPercent: 72,
    batteryVoltage: 22.4,
    gpsAccuracyM: 0.8,
  },
  navigation: {
    localizationMode: "GPS + visual-inertial",
    gpsStatus: "3D fix",
    satellites: 18,
    slamStatus: "Tracking",
    obstacleAvoidance: "Active",
  },
  communication: {
    connected: true,
    networkType: "Telemetry mesh",
    route: "SITL → telemetry gateway → dashboard",
    signalDbm: -62,
    linkQualityPercent: 91,
    telemetryLatencyMs: 42,
    videoLatencyMs: 186,
    lastCommunicationMs: 200,
  },
  payload: {
    assetId: "DR-02",
    medkitsAvailable: 2,
    bayStatus: "Ready",
    lastDrop: null,
  },
  fleet: [
    {
      id: "DR-01", role: "Survey + Edge AI", status: "Surveying Sector C", sector: "Sector C",
      batteryPercent: 72, meshQualityPercent: 91, mapX: 744, mapY: 444, implemented: true,
    },
    {
      id: "DR-02", role: "Medical Delivery", status: "Ready at LZ-01", sector: "LZ-01",
      batteryPercent: 88, meshQualityPercent: 94, mapX: 214, mapY: 464, implemented: true,
    },
    {
      id: "DR-03", role: "Mesh Relay", status: "Relay active", sector: "East relay",
      batteryPercent: 81, meshQualityPercent: 89, mapX: 812, mapY: 164, implemented: true,
    },
    {
      id: "UGV-01", role: "Ground Access", status: "Planned extension", sector: "Future node",
      batteryPercent: null, meshQualityPercent: null, mapX: null, mapY: null, implemented: false,
    },
  ],
  medicalResponse: {
    caseId: "MED-017",
    targetId: "SV-017",
    triage: "Immediate",
    status: "Awaiting payload clearance",
    requestedPayload: "Trauma medkit",
    assignedAsset: "DR-02",
    assignedTeam: "Alpha Medical",
    teamEta: "04:12",
    coordinates: "26.9126, 75.7873",
    dropZone: "Coordinate verified · operator clearance required",
    stages: [
      { id: "detect", label: "Detect", detail: "AI + thermal", state: "complete" },
      { id: "verify", label: "Verify", detail: "Geotag received", state: "complete" },
      { id: "triage", label: "Triage", detail: "Immediate", state: "complete" },
      { id: "dispatch", label: "Dispatch", detail: "DR-02 ready", state: "active" },
      { id: "handoff", label: "Handoff", detail: "Alpha Medical", state: "pending" },
    ],
  },
  edgeAi: {
    status: "Active",
    models: ["YOLOv8-S", "Thermal fusion"],
    fps: 27.8,
    latencyMs: 31,
    temperatureC: 67,
  },
  collisionAvoidance: {
    method: "Velocity-based CBF",
    desiredVelocity: { x: 7.8, y: -3.2, z: 0 },
    safeVelocity: { x: 4.1, y: -6.5, z: 0 },
    nearestObstacleId: "OBS-14",
    minimumClearanceM: 12.8,
    barrierMargin: 4.6,
    interventionPercent: 0,
    status: "Safe",
  },
  detections: [
    {
      id: "SV-017", kind: "survivor", label: "Survivor", condition: "Motionless · partially visible",
      people: 1, confidence: 94, accuracyM: 1.1, coordinates: "26.9126, 75.7873", location: "Rooftop C-14",
      severity: "Critical", priority: "Critical", verification: "Unverified", observedAt: "14:27:08", mapX: 666, mapY: 384,
      medicalPriority: "Immediate", requestedPayload: "Trauma medkit",
      nearbyHazards: ["Fast-moving floodwater"], responseStatus: "Medkit clearance pending",
    },
    {
      id: "SV-021", kind: "survivor", label: "Probable survivor", condition: "Waving · thermal-only",
      people: 3, confidence: 87, accuracyM: 1.7, coordinates: "26.9142, 75.7901", location: "School roof, east",
      severity: "High", priority: "High", verification: "Probable", observedAt: "14:26:31", mapX: 820, mapY: 318,
      medicalPriority: "Urgent", requestedPayload: "None",
      nearbyHazards: ["Floodwater"], responseStatus: "Awaiting verification",
    },
    {
      id: "SV-012", kind: "survivor", label: "Survivor", condition: "Moving · visible",
      people: 2, confidence: 98, accuracyM: 0.9, coordinates: "26.9108, 75.7819", location: "Market roof, west",
      severity: "Medium", priority: "Medium", verification: "Confirmed", observedAt: "14:18:44", mapX: 266, mapY: 338,
      medicalPriority: "Delayed", requestedPayload: "None",
      nearbyHazards: [], responseStatus: "Rescue dispatched",
    },
    {
      id: "HZ-009", kind: "hazard", label: "Possible structure fire", condition: "Expanding · smoke visible",
      confidence: 91, accuracyM: 1.3, coordinates: "26.9135, 75.7855", location: "Warehouse block D",
      severity: "High", priority: "High", verification: "Confirmed", observedAt: "14:22:16", mapX: 554, mapY: 270,
      affectedAreaM2: 340, recommendedDistanceM: 80, responseStatus: "Fire team on site",
    },
    {
      id: "HZ-011", kind: "hazard", label: "Fast-moving floodwater", condition: "Possible expansion east",
      confidence: 89, accuracyM: 2.2, coordinates: "26.9114, 75.7840", location: "Canal crossing 04",
      severity: "High", priority: "High", verification: "Unverified", observedAt: "14:25:52", mapX: 412, mapY: 408,
      affectedAreaM2: 1260, recommendedDistanceM: 40, responseStatus: "Route blocked",
    },
  ],
  alerts: [
    {
      id: "AL-105", priority: "Critical", title: "Geotag received at coordinate",
      location: "26.9126, 75.7873", time: "14:27:22", action: "Medkit drop requested",
      actionCommand: "DROP_MEDKIT", targetId: "GT-204", coordinates: "26.9126, 75.7873",
      assignedResponder: "DR-02", status: "Action required", acknowledged: false,
    },
    {
      id: "AL-104", priority: "Critical", title: "Motionless survivor near flood channel",
      location: "Rooftop C-14", time: "14:27:08", action: "Verify and dispatch medical team", acknowledged: false,
    },
    {
      id: "AL-103", priority: "High", title: "Three people detected on school roof",
      location: "East school block", time: "14:26:31", action: "Revisit for RGB confirmation", acknowledged: false,
    },
    {
      id: "AL-102", priority: "High", title: "Floodwater velocity increasing",
      location: "Canal crossing 04", time: "14:25:52", action: "Keep ground teams 40 m clear", acknowledged: false,
    },
    {
      id: "AL-101", priority: "Information", title: "Velocity-CBF safety filter active",
      location: "Waypoint 18", time: "14:24:40", action: "No operator action required", acknowledged: false,
    },
  ],
  timeline: [
    { id: "EV-01", time: "14:09:34", title: "Takeoff", detail: "LZ-01 · AUTO armed", type: "system" },
    { id: "EV-02", time: "14:18:44", title: "Survivors confirmed", detail: "SV-012 · two people", type: "detection" },
    { id: "EV-03", time: "14:22:16", title: "Fire detected", detail: "HZ-009 · high severity", type: "critical" },
    { id: "EV-04", time: "14:25:52", title: "Route blocked", detail: "Fast water at crossing 04", type: "critical" },
    { id: "EV-05", time: "14:27:08", title: "Priority detection", detail: "SV-017 · unverified", type: "critical" },
    { id: "EV-06", time: "14:27:22", title: "Geotag received", detail: "GT-204 · medkit requested", type: "critical" },
  ],
  droneLogs: [
    { id: "LOG-001", time: "14:08:58.104", source: "SYSTEM", level: "Info", message: "Gazebo SITL vehicle interface initialized", data: "DR-01 / world: river_district_07" },
    { id: "LOG-002", time: "14:09:00.218", source: "COMMS", level: "Info", message: "Telemetry mesh gateway connected", data: "RSSI -62 dBm / quality 91%" },
    { id: "LOG-003", time: "14:09:01.446", source: "NAV", level: "Info", message: "Localization solution ready", data: "GPS + visual-inertial / 18 satellites" },
    { id: "LOG-004", time: "14:09:02.031", source: "CBF", level: "Info", message: "Velocity safety filter armed", data: "alpha 1.2 / radius 6.0 m" },
    { id: "LOG-005", time: "14:09:34.000", source: "FLIGHT", level: "Info", message: "Takeoff accepted", data: "AUTO / target altitude 84 m" },
    { id: "LOG-006", time: "14:18:44.382", source: "AI", level: "Notice", message: "Survivor detection confirmed", data: "SV-012 / confidence 98%" },
    { id: "LOG-007", time: "14:22:16.190", source: "AI", level: "Warning", message: "Possible structure fire detected", data: "HZ-009 / confidence 91%" },
    { id: "LOG-008", time: "14:25:52.771", source: "NAV", level: "Warning", message: "Ground route marked blocked", data: "HZ-011 / fast-moving water" },
    { id: "LOG-009", time: "14:27:08.411", source: "AI", level: "Critical", message: "Motionless survivor detected", data: "SV-017 / rooftop C-14" },
    { id: "LOG-010", time: "14:27:22.063", source: "COMMS", level: "Critical", message: "Geotag received over telemetry mesh", data: "GT-204 / 26.9126, 75.7873" },
    { id: "LOG-011", time: "14:27:22.119", source: "SYSTEM", level: "Notice", message: "Medical response case created", data: "MED-017 / triage Immediate / target SV-017" },
    { id: "LOG-012", time: "14:27:22.284", source: "PAYLOAD", level: "Info", message: "Medical delivery asset assigned", data: "DR-02 / trauma medkit / operator clearance pending" },
  ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getInitialMissionState() {
  return clone(initialState);
}

function interpolateRoute(progressPercent) {
  const normalized = Math.max(0, Math.min(99.999, progressPercent)) / 100;
  const scaled = normalized * (routePoints.length - 1);
  const index = Math.floor(scaled);
  const local = scaled - index;
  const from = routePoints[index];
  const to = routePoints[Math.min(index + 1, routePoints.length - 1)];
  return {
    x: from[0] + (to[0] - from[0]) * local,
    y: from[1] + (to[1] - from[1]) * local,
    heading: (Math.atan2(to[0] - from[0], -(to[1] - from[1])) * 180 / Math.PI + 360) % 360,
  };
}

export function createMockGateway() {
  const state = clone(initialState);
  const subscribers = new Set();
  let tickCount = 0;
  let previousCbfStatus = state.collisionAvoidance.status;

  function emit() {
    const snapshot = clone(state);
    subscribers.forEach((listener) => listener(snapshot));
  }

  function addTimeline(title, detail, type = "system") {
    const now = new Date();
    state.timeline.push({
      id: `EV-${Date.now()}`,
      time: now.toLocaleTimeString("en-GB", { hour12: false }),
      title,
      detail,
      type,
    });
    state.timeline = state.timeline.slice(-7);
  }

  function addDroneLog(source, level, message, data = "—") {
    const now = new Date();
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
    state.droneLogs.push({
      id: `LOG-${Date.now()}-${state.droneLogs.length}`,
      time: `${now.toLocaleTimeString("en-GB", { hour12: false })}.${milliseconds}`,
      source,
      level,
      message,
      data,
    });
  }

  function tick() {
    tickCount += 1;
    const active = state.mission.state === "Surveying" && !state.mission.paused;
    if (active) {
      state.mission.elapsedSeconds += 1;
      state.mission.surveyedPercent = Math.min(99, state.mission.surveyedPercent + 0.006);
      state.mission.remainingAreaKm2 = Math.max(0.1, 10.6 * (1 - state.mission.surveyedPercent / 100));
      state.mission.currentWaypoint = Math.min(
        state.mission.totalWaypoints,
        Math.max(1, Math.ceil(state.mission.totalWaypoints * state.mission.surveyedPercent / 100)),
      );
      const routePosition = interpolateRoute(state.mission.surveyedPercent);
      state.vehicle.position.mapX = routePosition.x;
      state.vehicle.position.mapY = routePosition.y;
      state.vehicle.headingDeg = routePosition.heading;
      state.vehicle.position.lat += 0.000002;
      state.vehicle.position.lng += 0.000001;
      state.vehicle.altitudeM = 84.2 + Math.sin(tickCount / 8) * 0.45;
      state.vehicle.groundSpeedMps = 8.2 + Math.sin(tickCount / 5) * 0.35;
      state.vehicle.batteryPercent = Math.max(21, state.vehicle.batteryPercent - 0.0025);
      const surveyAsset = state.fleet.find((asset) => asset.id === state.vehicle.id);
      if (surveyAsset) {
        surveyAsset.batteryPercent = Math.floor(state.vehicle.batteryPercent);
        surveyAsset.meshQualityPercent = state.communication.linkQualityPercent;
        surveyAsset.mapX = state.vehicle.position.mapX;
        surveyAsset.mapY = state.vehicle.position.mapY;
      }

      const obstacleWave = (Math.sin(tickCount / 9) + 1) / 2;
      const intervening = obstacleWave > 0.72;
      state.collisionAvoidance.interventionPercent = intervening ? Math.round((obstacleWave - 0.72) * 180) : 0;
      state.collisionAvoidance.minimumClearanceM = 10.9 + (1 - obstacleWave) * 4.2;
      state.collisionAvoidance.barrierMargin = 2.8 + (1 - obstacleWave) * 2.9;
      state.collisionAvoidance.status = intervening ? "Filtering" : "Safe";
      state.collisionAvoidance.safeVelocity.x = intervening ? 5.2 : 7.8;
      state.collisionAvoidance.safeVelocity.y = intervening ? -5.4 : -3.2;

      if (state.collisionAvoidance.status !== previousCbfStatus) {
        addDroneLog(
          "CBF",
          intervening ? "Warning" : "Info",
          intervening ? "Velocity command filtered" : "Nominal velocity command restored",
          `clearance ${state.collisionAvoidance.minimumClearanceM.toFixed(1)} m / h(x) ${state.collisionAvoidance.barrierMargin.toFixed(1)}`,
        );
        previousCbfStatus = state.collisionAvoidance.status;
      }

      if (tickCount % 10 === 0) {
        addDroneLog(
          "FLIGHT",
          "Telemetry",
          "Vehicle state sample",
          `ALT ${state.vehicle.altitudeM.toFixed(1)} m / GS ${state.vehicle.groundSpeedMps.toFixed(1)} m/s / HDG ${Math.round(state.vehicle.headingDeg)}° / BAT ${Math.floor(state.vehicle.batteryPercent)}%`,
        );
      }

      if (tickCount % 15 === 0) {
        addDroneLog(
          "COMMS",
          "Telemetry",
          "Telemetry mesh heartbeat",
          `RSSI ${state.communication.signalDbm} dBm / quality ${state.communication.linkQualityPercent}% / latency ${state.communication.telemetryLatencyMs} ms`,
        );
      }
    }
    emit();
  }

  const timer = window.setInterval(tick, 1000);

  return {
    subscribe(listener) {
      subscribers.add(listener);
      listener(clone(state));
      return () => subscribers.delete(listener);
    },
    snapshot() {
      return clone(state);
    },
    command(type, payload = {}) {
      let accepted = true;
      let reason = "Command accepted by simulated flight controller";
      switch (type) {
        case "START":
          state.mission.state = "Surveying";
          state.mission.paused = false;
          state.vehicle.flightMode = "AUTO";
          state.vehicle.armed = true;
          addTimeline("Mission started", "Survey route resumed", "system");
          break;
        case "PAUSE":
          state.mission.paused = true;
          state.vehicle.flightMode = "HOLD";
          state.vehicle.groundSpeedMps = 0;
          addTimeline("Mission paused", "Position hold requested", "system");
          break;
        case "RESUME":
          state.mission.paused = false;
          state.mission.state = "Surveying";
          state.vehicle.flightMode = "AUTO";
          addTimeline("Mission resumed", "Waypoint navigation active", "system");
          break;
        case "RETURN_HOME":
          state.mission.state = "Returning home";
          state.mission.paused = false;
          state.vehicle.flightMode = "RTL";
          addTimeline("Return to home", "Operator confirmed · LZ-01", "critical");
          break;
        case "EMERGENCY_LAND":
          state.mission.state = "Emergency";
          state.mission.paused = false;
          state.vehicle.flightMode = "LAND";
          addTimeline("Emergency landing", "Operator confirmed · nearest safe site", "critical");
          break;
        case "DROP_MEDKIT": { 
          const alert = state.alerts.find((item) => item.id === payload.alertId)
            ?? state.alerts.find((item) => item.actionCommand === "DROP_MEDKIT" && !item.acknowledged);
          const coordinates = payload.coordinates ?? alert?.coordinates ?? "unknown coordinate";
          if (state.payload.medkitsAvailable < 1) {
            accepted = false;
            reason = "Medkit bay is empty";
            break;
          }
          state.payload.medkitsAvailable -= 1;
          state.payload.bayStatus = state.payload.medkitsAvailable > 0 ? "Ready" : "Empty";
          state.payload.lastDrop = {
            targetId: payload.targetId ?? alert?.targetId ?? "GEOTAG",
            coordinates,
            time: new Date().toISOString(),
            result: "Released in Gazebo SITL",
            assetId: state.payload.assetId,
          };
          if (alert) {
            alert.acknowledged = true;
            alert.status = "Medkit dispatched";
          }
          const deliveryAsset = state.fleet.find((asset) => asset.id === state.payload.assetId);
          if (deliveryAsset) deliveryAsset.status = "Payload delivered · returning";
          state.medicalResponse.status = "Medkit delivered · team handoff active";
          state.medicalResponse.dropZone = "SITL release complete · coordinate logged";
          state.medicalResponse.stages = state.medicalResponse.stages.map((stage) => {
            if (stage.id === "dispatch") return { ...stage, detail: "Medkit delivered", state: "complete" };
            if (stage.id === "handoff") return { ...stage, detail: "Alpha en route", state: "active" };
            return stage;
          });
          const target = state.detections.find((item) => item.id === state.medicalResponse.targetId);
          if (target) target.responseStatus = "Medkit delivered · team en route";
          reason = `${state.payload.assetId} released one medkit at ${coordinates} in Gazebo SITL`;
          addTimeline("Medkit dispatched", `${state.payload.assetId} → ${payload.targetId ?? alert?.targetId ?? "GEOTAG"}`, "detection");
          addDroneLog("PAYLOAD", "Notice", "Medkit drop command completed", `${state.payload.assetId} / ${coordinates} / ${state.payload.medkitsAvailable} remaining`);
          break;
        }
        case "ACK_ALERT": {
          const alert = state.alerts.find((item) => item.id === payload.id);
          if (alert) alert.acknowledged = true;
          else { accepted = false; reason = "Alert not found"; }
          break;
        }
        case "VERIFY_DETECTION": {
          const detection = state.detections.find((item) => item.id === payload.id);
          if (detection) {
            detection.verification = payload.status;
            detection.responseStatus = payload.status === "Confirmed" ? "Awaiting team assignment" : "Closed as false detection";
            addTimeline(
              payload.status === "Confirmed" ? "Detection confirmed" : "Detection rejected",
              `${detection.id} · operator review`,
              "detection",
            );
          } else { accepted = false; reason = "Detection not found"; }
          break;
        }
        default:
          accepted = false;
          reason = `Unsupported command: ${type}`;
      }
      addDroneLog(
        "COMMAND",
        accepted ? "Notice" : "Warning",
        `${type.replaceAll("_", " ")} ${accepted ? "accepted" : "rejected"}`,
        reason,
      );
      emit();
      return Promise.resolve({
        commandId: `CMD-${Date.now()}`,
        accepted,
        vehicleTimestamp: new Date().toISOString(),
        reason,
      });
    },
    destroy() {
      window.clearInterval(timer);
      subscribers.clear();
    },
  };
}
