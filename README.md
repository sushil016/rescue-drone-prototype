# RoboNerve Emergency Response Command

A Next.js App Router prototype for a role-based drone and robot emergency-response system. The current working scenario combines flood search, medical assistance, and rescue-team coordination using Gazebo SITL data.

## Run the prototype

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a production build with:

```bash
npm run build
```

## Project structure

- `app/layout.jsx` — root layout, metadata, and self-hosted Inter font
- `app/page.jsx` — App Router entry page
- `components/gcs-dashboard.jsx` — client-side dashboard shell, commands, exports, and confirmation state
- `components/live-mission.jsx` — live map, video, alerts, timeline, telemetry, and mission controls
- `components/secondary-views.jsx` — detections, planning, health, reports, and history views
- `src/telemetry-adapter.js` — replaceable simulated telemetry/command gateway
- `src/styles.css` — responsive GCS visual system

## Implemented in the first prototype

- Live emergency-response map with mission boundary, survey route, role-based vehicle markers, GPS uncertainty, no-fly zone, safe/blocked routes, and clickable survivor/hazard markers
- Simulated drone position, heading, altitude, speed, battery, flight mode, GPS/link health, and mission progress
- RGB and thermal feed modes with detections, recording controls, capture feedback, metadata, and AI overlay control
- Priority alert queue with acknowledgement and a confirmation-gated geotag medkit-drop action
- Survivor/hazard review table with medical triage, confirm, and reject actions
- Detection-to-handoff medical workflow covering geotag verification, triage, payload dispatch, and ground-team coordination
- Role-based response assets: DR-01 survey/edge AI, DR-02 medical delivery, and DR-03 telemetry-mesh relay
- UGV-01 shown explicitly as a planned ground-access extension, not as implemented hardware
- Velocity-based CBF safety panel showing desired velocity, safe velocity, minimum clearance, barrier margin, and filter intervention
- Confirmation-gated Return Home and Emergency Land commands
- Full, filterable drone log stream covering flight, navigation, CBF, AI, commands, payload events, and telemetry-mesh health
- Mission planning, health, detections, reports/history, CSV export, JSON export, and printable situational report views
- Responsive desktop and mobile layouts

## Integration boundary

The browser imports all live state through `src/telemetry-adapter.js`. The UI does not directly depend on ROS, MAVLink, the telemetry radio, or a specific simulator. Replace `createMockGateway()` with a backend gateway that implements:

```js
{
  subscribe(listener),        // listener(normalizedMissionState)
  snapshot(),                 // current normalizedMissionState
  command(type, payload),     // Promise<commandAcknowledgement>
  destroy()
}
```

The normalized fields and allowed mission states are declared in `TELEMETRY_CONTRACT` in that file.

## Intended data path

The prototype source path is:

```text
Gazebo SITL fleet → MAVLink/ROS bridge → backend telemetry gateway → Next.js dashboard
```

The intended product path is:

```text
Response assets → telemetry mesh → authenticated backend gateway → Next.js dashboard
```

The dashboard should receive normalized state and command acknowledgements from the backend. It must not assume Wi-Fi, 4G, or 5G connectivity to the aircraft.

## Inputs needed for SITL integration

Please provide these when we start the live connection step:

1. Autopilot and simulator: PX4 or ArduPilot, version, Gazebo/Ignition version, world name, and vehicle model.
2. Middleware: ROS 1/ROS 2 distribution, MAVROS/MAVSDK/custom bridge, SITL connection ports, and the backend WebSocket or API endpoint exposed to the dashboard.
3. Topic/API list with message types and expected rates for pose/odometry, GPS, vehicle status, battery, mission progress, obstacle data, command acknowledgement, and link health.
4. Coordinate conventions: ENU or NED, map/world origin, body frame, velocity frame, and units.
5. CBF output contract: desired velocity, filtered safe velocity, definition of `h(x)`, class-K/alpha value, nearest-obstacle representation, solver status, intervention percentage, update rate, and fallback when the solver is infeasible or stale.
6. Command endpoints and acknowledgement rules for start, pause, resume, skip waypoint, investigate/revisit, medkit drop, Return Home, abort, and emergency land.
7. RGB/thermal delivery method: WebRTC, RTSP converted by a backend, MJPEG, HLS, or ROS image topics; include image timestamps and camera calibration if available.
8. Detection messages: survivor/hazard IDs, RGB/thermal evidence references, coordinates, covariance/accuracy, confidence, class, severity, timestamp, and tracking/verification state.

Do not expose rosbridge, MAVLink, the mesh-radio interface, or a command socket directly to an untrusted network. The backend adapter should authenticate operators, validate commands server-side, timestamp acknowledgements, and fail closed when telemetry becomes stale.
