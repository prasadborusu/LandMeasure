# 🌍 LandMeasure — High-Precision Geodesic Land Area & Perimeter Measurement

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![GeographicLib](https://img.shields.io/badge/Engine-GeographicLib%20(Karney)-10B981)](https://geographiclib.sourceforge.io/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet%201.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **LandMeasure** is an enterprise-grade geospatial web application engineered for land surveyors, civil engineers, real estate professionals, and agricultural planners. It computes authoritative geodesic boundary lengths and polygon land areas directly on the **WGS84 Reference Ellipsoid** using Charles Karney's algorithms, eliminating the distortion inherent in planar map projections and spherical approximations.

---

## 📑 Table of Contents
1. [Overview & Core Value](#-overview--core-value)
2. [Why Standard Map Tools Fail (The Problem)](#-why-standard-map-tools-fail-the-problem)
3. [Geodetic Mathematical Foundations & Formulas](#-geodetic-mathematical-foundations--formulas)
   - [3.1 The WGS84 Reference Ellipsoid Model](#31-the-wgs84-reference-ellipsoid-model)
   - [3.2 Geodesic Inverse Distance (Karney's Algorithm & Clairaut's Relation)](#32-geodesic-inverse-distance-karneys-algorithm--clairauts-relation)
   - [3.3 Geodesic Polygon Area (Gauss-Bonnet Ellipsoidal Quadrature)](#33-geodesic-polygon-area-gauss-bonnet-ellipsoidal-quadrature)
   - [3.4 Geodesic Midpoint Determination](#34-geodesic-midpoint-determination)
   - [3.5 Comparative Analysis: WGS84 vs. Haversine vs. Web Mercator](#35-comparative-analysis-wgs84-vs-haversine-vs-web-mercator)
4. [Land Measurement Units & Conversion Matrix](#-land-measurement-units--conversion-matrix)
   - [4.1 Metric & Imperial Standards](#41-metric--imperial-standards)
   - [4.2 Traditional Indian Land Measurement Units](#42-traditional-indian-land-measurement-units)
   - [4.3 Comprehensive Conversion Multipliers](#43-comprehensive-conversion-multipliers)
5. [Geometric Validation & Self-Intersection Detection](#-geometric-validation--self-intersection-detection)
   - [5.1 Orientation & Cross-Product (CCW) Algorithm](#51-orientation--cross-product-ccw-algorithm)
   - [5.2 Strict Segment Straddle & Collinear Overlap Tests](#52-strict-segment-straddle--collinear-overlap-tests)
   - [5.3 Vertex Proximity & Coordinate Filtering](#53-vertex-proximity--coordinate-filtering)
6. [Positional Accuracy Hierarchy & Real-World GNSS](#-positional-accuracy-hierarchy--real-world-gnss)
7. [System Architecture & State Lifecycle](#-system-architecture--state-lifecycle)
8. [Comprehensive Export Engine](#-comprehensive-export-engine)
   - [8.1 GeoJSON (RFC 7946)](#81-geojson-rfc-7946)
   - [8.2 CSV Boundary Vertices](#82-csv-boundary-vertices)
   - [8.3 Survey Dossier PDF Generation](#83-survey-dossier-pdf-generation)
9. [Component Architecture](#-component-architecture)
10. [Local Development & Setup](#-local-development--setup)
11. [Legal Survey & Cadastral Disclaimer](#-legal-survey--cadastral-disclaimer)

---

## 🎯 Overview & Core Value

Traditional map tools measure distance and area either by treating coordinates as planar Cartesian points ($X, Y$) on a projected map, or by approximating Earth as a sphere. Both approaches introduce severe mathematical errors:
- **Planar Web Mercator projection ($EPSG:3857$)** distorts areas by $10\%$ to over $100\%$ away from the equator.
- **Spherical Haversine formulas** ignore Earth's polar flattening ($f \approx 1/298.257$), generating errors up to $0.5\%$ ($5\text{ meters per kilometer}$).

**LandMeasure** solves this by implementing **GeographicLib**, utilizing the world-standard **Karney algorithm** for geodesic distance and polygon area directly over the oblate **WGS84 ellipsoid**. The calculations achieve theoretical double-precision numerical accuracy to within **$\approx 15\text{ nanometers}$**.

### ✨ Highlights
- **Authoritative Geodesic Calculations**: Distance and parcel area computed on the true ellipsoidal surface of the Earth.
- **Multi-Unit Output**: Instant real-time conversion across **Square Meters ($m^2$)**, **Acres**, **Cents**, **Hectares ($ha$)**, and **Square Kilometers ($km^2$)**.
- **Edge Distance Badges**: Displays dynamic distance tags placed at the exact geodesic midpoints along each boundary edge.
- **Live GNSS / GPS Telemetry**: Real-time geolocation tracking with accuracy radius indicators and status diagnostics.
- **Topology & Self-Intersection Detection**: Real-time validation preventing invalid, twisted, or self-intersecting polygon boundaries.
- **Multi-Provider Tile Engine**: Seamlessly switch between OpenStreetMap Standard, Esri World Satellite Imagery, and Topographic views.
- **Full Offline Client-Side Execution**: Zero server round-trips; calculations occur entirely within the browser, safeguarding sensitive property boundaries.
- **Cadastral Export Dossier**: One-click export to **GeoJSON (RFC 7946)**, **CSV**, and **multi-page branded PDF reports** featuring embedded map snapshots.

---

## ⚠️ Why Standard Map Tools Fail (The Problem)

### 1. The Planar Projection Trap
Most web maps project geographic coordinates $(\phi, \lambda)$ onto a 2D Euclidean grid via Web Mercator ($EPSG:3857$):
$$x = R \lambda, \quad y = R \ln \left[ \tan \left( \frac{\pi}{4} + \frac{\phi}{2} \right) \right]$$

Applying Euclidean distance $\sqrt{\Delta x^2 + \Delta y^2}$ or the standard Shoelace area formula $\frac{1}{2} |\sum (x_i y_{i+1} - x_{i+1} y_i)|$ to these projected coordinates scales the area by:
$$k_{\text{area}} = \sec^2 \phi = \frac{1}{\cos^2 \phi}$$

| Latitude ($\phi$) | Example Region | Planar Area Inflation ($k_{\text{area}}$) | Error Percentage |
| :--- | :--- | :--- | :--- |
| **$0^\circ$** | Equator (Ecuador, Kenya) | $1.000$ | $0.0\%$ |
| **$15^\circ$** | South India (Bangalore, Chennai) | $1.072$ | $+7.2\%$ |
| **$28^\circ$** | North India (Delhi), Florida | $1.285$ | $+28.5\%$ |
| **$45^\circ$** | France, Northern USA | $2.000$ | $+100.0\%$ (Double!) |
| **$60^\circ$** | Scandinavia, Alaska | $4.000$ | $+300.0\%$ (Quadruple!) |

### 2. The Spherical Assumption Error
Treating Earth as a sphere with mean radius $R = 6,371,000\text{ m}$ ignores the equatorial bulge. Because Earth's radius varies from $6,356,752.3\text{ m}$ at the poles to $6,378,137.0\text{ m}$ at the equator, spherical methods produce errors up to **$5\text{ meters per kilometer}$** ($0.5\%$), which is intolerable for legal and agricultural surveying.

---

## 📐 Geodetic Mathematical Foundations & Formulas

### 3.1 The WGS84 Reference Ellipsoid Model
The World Geodetic System 1984 (WGS84) defines Earth as an oblate ellipsoid of revolution with the following fundamental parameters:

| Parameter | Symbol | Exact Value | Description |
| :--- | :--- | :--- | :--- |
| **Semi-Major Axis** | $a$ | $6,378,137.0 \text{ m}$ | Equatorial radius of the Earth |
| **Reciprocal Flattening** | $1/f$ | $298.257223563$ | Primary defining geometric shape constant |
| **Flattening** | $f$ | $\frac{a - b}{a} \approx 0.00335281066474748$ | Measure of polar compression |
| **Semi-Minor Axis** | $b$ | $b = a(1 - f) \approx 6,356,752.314245 \text{ m}$ | Polar radius of the Earth |
| **First Eccentricity Squared** | $e^2$ | $e^2 = \frac{a^2 - b^2}{a^2} = 2f - f^2 \approx 0.00669437999014$ | Primary eccentricity metric |
| **Second Eccentricity Squared** | $e'^2$ | $e'^2 = \frac{a^2 - b^2}{b^2} = \frac{e^2}{1 - e^2} \approx 0.00673949674228$ | Secondary eccentricity metric |

---

### 3.2 Geodesic Inverse Distance (Karney's Algorithm & Clairaut's Relation)
A geodesic is the shortest curve connecting two points along a curved surface. On the oblate ellipsoid, geodesics satisfy **Clairaut's Equation**:
$$c = a \cos \beta \sin \alpha = \text{constant}$$
where:
- $\beta$ is the **reduced (parametric) latitude**, related to geodetic latitude $\phi$ by:
  $$\tan \beta = (1 - f) \tan \phi$$
- $\alpha$ is the forward azimuth of the geodesic at latitude $\beta$.

The ellipsoidal arc length $s_{12}$ between points $P_1(\phi_1, \lambda_1)$ and $P_2(\phi_2, \lambda_2)$ is defined by the elliptic path integral:
$$s_{12} = b \int_{\sigma_1}^{\sigma_2} \sqrt{1 + k^2 \sin^2 \sigma} \, d\sigma$$
where:
$$k^2 = e'^2 \cos^2 \alpha_0$$
and $\sigma$ represents the angular distance along the corresponding great circle on an auxiliary sphere.

#### Karney's Solution:
Charles Karney solves this integral via series expansions in terms of the third flattening:
$$n = \frac{a - b}{a + b} = \frac{f}{2 - f}$$
The series is evaluated up to order $n^6$:
$$s_{12} = b (1 + A) \left( \sigma + \sum_{l=1}^{6} C_l \sin(2l\sigma) \right)$$
This yields double-precision convergence accurate to **$\approx 15\text{ nanometers}$** across any distance on the globe, including near-antipodal paths.

---

### 3.3 Geodesic Polygon Area (Gauss-Bonnet Ellipsoidal Quadrature)
According to the **Gauss-Bonnet Theorem**, for a closed polygon $\Omega$ with $n$ vertices on a two-dimensional Riemannian manifold:
$$\iint_{\Omega} K \, dA + \oint_{\partial \Omega} \kappa_g \, ds + \sum_{i=1}^n (\pi - \alpha_i) = 2\pi$$

Because the edges of the polygon are geodesics, the geodesic curvature along every segment is strictly zero ($\kappa_g = 0$). Thus:
$$\text{Area}(\Omega) = \iint_{\Omega} K \, dA = 2\pi - \sum_{i=1}^n (\pi - \alpha_i) = \sum_{i=1}^n \alpha_i - (n - 2)\pi$$
where $K$ is the Gaussian curvature of the WGS84 ellipsoid:
$$K = \frac{1}{R_N R_M} = \frac{1 - e^2 \sin^2 \phi}{a^2 (1 - e^2)}$$

#### Practical Computation in GeographicLib:
To compute the area of a closed polygon with vertices $P_0, P_1, \dots, P_{n-1}$, GeographicLib sums the ellipsoidal surface area between each geodesic edge and the equator:
$$\text{Area} = \left| \sum_{i=0}^{n-1} \Delta A(P_i, P_{(i+1) \bmod n}) \right|$$
where $\Delta A(P_i, P_{i+1})$ is the area of the geodesic quadrilateral bounded by the segment $(P_i, P_{i+1})$, the two meridians through $P_i$ and $P_{i+1}$, and the equator.

#### Antimeridian & Global Wrap-Around:
The total surface area of the WGS84 ellipsoid is:
$$S_{\text{total}} = 2\pi a^2 \left( 1 + \frac{1 - e^2}{2e} \ln \left( \frac{1 + e}{1 - e} \right) \right) \approx 510,065,621,724,088.5 \text{ m}^2$$
If the computed polygon area $A > \frac{S_{\text{total}}}{2}$, the parcel area represents the inverse exterior of the globe and is normalized:
$$A_{\text{parcel}} = S_{\text{total}} - A$$

---

### 3.4 Geodesic Midpoint Determination
To place measurement labels at the true physical center of each edge, LandMeasure executes the **Direct Geodesic Problem**:
1. Compute total distance $s_{12}$ and initial azimuth $\alpha_1$ from $P_1$ to $P_2$ using the Inverse Problem.
2. Step along the geodesic path with arc distance:
   $$s_{\text{mid}} = \frac{s_{12}}{2}$$
3. Compute midpoint coordinates $(\phi_{\text{mid}}, \lambda_{\text{mid}})$:
   $$(\phi_{\text{mid}}, \lambda_{\text{mid}}) = \text{Direct}(P_1, \alpha_1, s_{\text{mid}})$$

---

### 3.5 Comparative Analysis: WGS84 vs. Haversine vs. Web Mercator

| Feature / Metric | WGS84 Geodesic (LandMeasure) | Spherical Haversine | Planar Web Mercator ($EPSG:3857$) |
| :--- | :--- | :--- | :--- |
| **Earth Geometry** | Oblate Ellipsoid ($a \ne b$) | Sphere ($R = 6371\text{km}$) | Flat Projected Plane |
| **Polar Flattening** | Accounted for ($1/298.257$) | Ignored ($f = 0$) | Distorted by projection |
| **Distance Formula** | Karney Elliptic Integral | $2R \arcsin(\sqrt{\dots})$ | $\sqrt{\Delta X^2 + \Delta Y^2}$ |
| **Area Formula** | Gauss-Bonnet Integral Quadrature | L'Huilier Spherical Excess | Standard Planar Shoelace |
| **Numerical Accuracy** | $\approx 15 \text{ nanometers}$ | $\approx 0.5\%$ ($5\text{ m/km}$) | Distorted $+10\%$ to $+300\%$ |
| **Cadastral Suitability** | **Authoritative & Recommended** | Rough Estimation Only | Visualization Only (Unsuitable) |

---

## 📏 Land Measurement Units & Conversion Matrix

LandMeasure provides lossless conversion across international and regional land units:

### 4.1 Metric & Imperial Standards
- **Square Meter ($\text{m}^2$)**: Primary standard SI base unit of area.
- **Hectare ($\text{ha}$)**:
  $$1 \text{ ha} = 10,000 \text{ m}^2 = 0.01 \text{ km}^2 \approx 2.4710538 \text{ Acres}$$
- **Square Kilometer ($\text{km}^2$)**:
  $$1 \text{ km}^2 = 1,000,000 \text{ m}^2 = 100 \text{ ha} \approx 247.10538 \text{ Acres}$$
- **Acre (International)**:
  $$1 \text{ Acre} = 4,046.8564224 \text{ m}^2 = 43,560 \text{ sq ft} = 4,840 \text{ sq yd}$$

---

### 4.2 Traditional Indian Land Measurement Units
- **Cent**: Predominantly used in South India (Andhra Pradesh, Telangana, Tamil Nadu, Kerala, Karnataka):
  $$1 \text{ Cent} = \frac{1}{100} \text{ Acre} = 40.468564224 \text{ m}^2 = 435.6 \text{ sq ft}$$
  $$1 \text{ Acre} = 100 \text{ Cents}$$
- **Guntha (Gunta)**: Used in Maharashtra, Gujarat, Karnataka, Andhra Pradesh, and Telangana:
  $$1 \text{ Guntha} = \frac{1}{40} \text{ Acre} = 101.17141056 \text{ m}^2 = 121 \text{ sq yd} = 1,089 \text{ sq ft}$$
  $$1 \text{ Acre} = 40 \text{ Gunthas} = 2.5 \text{ Cents per Guntha}$$
- **Ground**: Used in urban Tamil Nadu:
  $$1 \text{ Ground} = 2,400 \text{ sq ft} \approx 222.9673 \text{ m}^2 \approx 5.51 \text{ Cents}$$
- **Bigha (Standard Pucca)**: Common across North & Central India (UP, Bihar, MP, Rajasthan):
  $$1 \text{ Bigha} \approx 2,529.285 \text{ m}^2 = 27,225 \text{ sq ft} = \frac{5}{8} \text{ Acre}$$
- **Biswa**: Sub-unit of Bigha:
  $$1 \text{ Biswa} = \frac{1}{20} \text{ Bigha} \approx 126.464 \text{ m}^2 = 1,361.25 \text{ sq ft}$$
- **Kanal and Marla**: Used in Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir:
  $$1 \text{ Kanal} = 20 \text{ Marlas} = 505.857 \text{ m}^2 = \frac{1}{8} \text{ Acre}$$
  $$1 \text{ Marla} = 25.29285 \text{ m}^2 = 272.25 \text{ sq ft}$$

---

### 4.3 Comprehensive Conversion Multipliers

$$\text{Area}_{\text{target}} = \text{Area}_{\text{m}^2} \times \text{Multiplier}$$

| Unit | Symbol | Factor in $\text{m}^2$ | Decimal Precision |
| :--- | :--- | :--- | :--- |
| **Square Meters** | $\text{m}^2$ | $1.0$ | $2$ decimal places |
| **Acres** | $\text{acres}$ | $1 / 4,046.8564224 \approx 0.00024710538$ | $3$ decimal places |
| **Cents** | $\text{cents}$ | $1 / 40.468564224 \approx 0.024710538$ | $2$ decimal places |
| **Hectares** | $\text{ha}$ | $1 / 10,000 = 0.0001$ | $4$ decimal places |
| **Square Kilometers** | $\text{km}^2$ | $1 / 1,000,000 = 0.000001$ | $4$ decimal places |

---

## 🛡️ Geometric Validation & Self-Intersection Detection

To guarantee that surveyed land boundaries represent valid topological simple polygons, LandMeasure applies real-time geometry validation before computing area:

```text
[User Pins Vertex]
        │
        ▼
[Coordinate Limits Check] ──(-90° ≤ lat ≤ 90°, -180° ≤ lng ≤ 180°)──► (Valid?)
        │ Yes
        ▼
[Proximity Check] ──(Distance < 0.20m to consecutive vertex?)──► (Filter duplicate)
        │ Pass
        ▼
[Segment Intersection Engine] ──(2D CCW & Straddle test on non-adjacent edges)
        │
   ┌────┴──────────────────────────┐
   │                               │
(Self-Intersection Detected)   (Simple Polygon)
   │                               │
   ▼                               ▼
[Display Visual Error Alert]   [Compute WGS84 Geodesic Polygon Area]
[Block Invalid Area]           [Render Edge Badges & Summary]
```

### 5.1 Orientation & Cross-Product (CCW) Algorithm
For three 2D points $A(x_A, y_A)$, $B(x_B, y_B)$, and $C(x_C, y_C)$:
$$\text{CCW}(A, B, C) = (B_x - A_x)(C_y - A_y) - (B_y - A_y)(C_x - A_x)$$
- $\text{CCW} > 0$: Counter-clockwise orientation (left turn)
- $\text{CCW} < 0$: Clockwise orientation (right turn)
- $\text{CCW} = 0$: Collinear points

### 5.2 Strict Segment Straddle & Collinear Overlap Tests
Two non-adjacent segments $P_1 P_2$ and $P_3 P_4$ intersect strictly if:
$$\left[\text{CCW}(P_3, P_4, P_1) \cdot \text{CCW}(P_3, P_4, P_2) < 0\right] \land \left[\text{CCW}(P_1, P_2, P_3) \cdot \text{CCW}(P_1, P_2, P_4) < 0\right]$$
Collinear cases are resolved using bounding-box inclusion:
$$\min(P_{1x}, P_{2x}) \le P_{3x} \le \max(P_{1x}, P_{2x}) \quad \land \quad \min(P_{1y}, P_{2y}) \le P_{3y} \le \max(P_{1y}, P_{2y})$$

---

## 🛰️ Positional Accuracy Hierarchy & Real-World GNSS

While LandMeasure's geodesic math engine is accurate to **$\approx 15\text{ nanometers}$**, real-world boundary accuracy is limited by the **source coordinates**:

```text
┌────────────────────────────────────────────────────────┐
│              Calculated Land Area Output               │
└───────────────────────────▲────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────┐
│          WGS84 Karney Geodesic Calculation             │
│        (Precision: ~15 nanometers numerical)           │
└───────────────────────────▲────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────┐
│                   Input Coordinates                    │
│    (GPS Receiver, Map Pinning, Satellite Clicks)       │
└───────────────────────────▲────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────┐
│           Real-World Positional Uncertainty            │
│         (Atmosphere, Multipath, Device Sensor)         │
└────────────────────────────────────────────────────────┘
```

| Source / Equipment Tier | Typical Positional Accuracy | Recommended Application |
| :--- | :--- | :--- |
| **Consumer Smartphone GPS** | $3.0 - 10.0 \text{ meters}$ | Preliminary reconnaissance, exploratory estimates |
| **Dual-Frequency Phone (L1/L5)** | $1.5 - 3.0 \text{ meters}$ | Field scouting, recreational boundary marking |
| **High-Resolution Satellite Orthophoto** | $0.5 - 1.5 \text{ meters}$ | Visual farm planning, property visualization |
| **Differential GNSS (DGPS / SBAS)** | $0.5 - 1.0 \text{ meters}$ | GIS asset management, forestry, municipal planning |
| **Survey-Grade RTK / PPK Receiver** | **$0.01 - 0.02 \text{ meters}$ ($1-2\text{ cm}$)** | **Authoritative Cadastral Surveying & Legal Boundary Registry** |

---

## 🏗️ System Architecture & State Lifecycle

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│                             Application Root                                  │
│                                (App.tsx)                                      │
├──────────────────────────────────────┬────────────────────────────────────────┤
│             Desktop Layout           │             Mobile Layout              │
│  ┌──────────────┬──────────────────┐ │  ┌──────────────────────────────────┐  │
│  │ TopBar       │ NavigationSidebar│ │  │ TopBar (Responsive Title & Tools)│  │
│  ├──────────────┴──────────────────┤ │  ├──────────────────────────────────┤  │
│  │ MapView (Leaflet + Tiles)       │ │  │ MapView (Full viewport touch UI) │  │
│  │  - Boundary Polygons            │ │  ├──────────────────────────────────┤  │
│  │  - Vertex Markers (Draggable)   │ │  │ MobileBottomSheet (Drawer UI)    │  │
│  │  - Edge Distance Badges         │ │  │  - Area & Perimeter Cards        │  │
│  ├─────────────────────────────────┤ │  │  - Unit Switcher Tabs            │  │
│  │ MeasurementPanel (Sidebar Info) │ │  │  - Add / Undo / Clear Buttons    │  │
│  └─────────────────────────────────┘ │  └──────────────────────────────────┘  │
├──────────────────────────────────────┴────────────────────────────────────────┤
│                          Modals & Telemetry Overlays                          │
│   [ExportModal]  •  [AccuracyInfoModal]  •  [LiveLocationBar]  •  [Toast]     │
├───────────────────────────────────────────────────────────────────────────────┤
│                          Core Computational Services                          │
│   geodesic.ts  •  areaCalculator.ts  •  unitConverter.ts  •  pdfExporter.ts   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Comprehensive Export Engine

### 8.1 GeoJSON (RFC 7946)
Produces compliant GeoJSON Feature Collections in WGS84 coordinates ($EPSG:4326$):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [78.486671, 17.385044],
            [78.487571, 17.385044],
            [78.487571, 17.385944],
            [78.486671, 17.385944],
            [78.486671, 17.385044]
          ]
        ]
      },
      "properties": {
        "areaM2": 10000.0,
        "areaAcres": 2.471,
        "areaCents": 247.1,
        "perimeterMeters": 400.0,
        "pointCount": 4,
        "calculatedAt": "2026-10-10T10:48:22Z"
      }
    }
  ]
}
```

### 8.2 CSV Boundary Vertices
Exports tabular boundary coordinates ready for CAD / GIS importing:
```csv
Point,Latitude,Longitude,Next_Edge_Distance_m
1,17.385044,78.486671,100.00
2,17.385044,78.487571,100.00
3,17.385944,78.487571,100.00
4,17.385944,78.486671,100.00
```

### 8.3 Survey Dossier PDF Generation
Generates multi-page formal PDF reports using `jspdf` and `html2canvas`:
- High-resolution map thumbnail rasterization
- Prominent metrics cards (Total area across all 5 units, perimeter)
- Vertex latitude & longitude table formatted to 6 decimal places
- Segment length ledger
- Geodetic methodology references and legal disclaimer

---

## 🧩 Component Architecture

| Component | Responsibility |
| :--- | :--- |
| [`MapView.tsx`](file:///d:/landmesure/src/components/MapView.tsx) | Leaflet map container, geodesic polygon rendering, marker dragging, edge midpoint label placement. |
| [`MeasurementPanel.tsx`](file:///d:/landmesure/src/components/MeasurementPanel.tsx) | Desktop side panel presenting real-time area results, active unit switcher, and point count. |
| [`MobileBottomSheet.tsx`](file:///d:/landmesure/src/components/MobileBottomSheet.tsx) | Touch-optimized swipeable bottom drawer for smartphones and tablets. |
| [`AccuracyInfoModal.tsx`](file:///d:/landmesure/src/components/AccuracyInfoModal.tsx) | Interactive educational modal displaying mathematical equations, accuracy hierarchy, and ellipsoidal theory. |
| [`ExportModal.tsx`](file:///d:/landmesure/src/components/ExportModal.tsx) | Modal interface for downloading GeoJSON, CSV, and generating branded PDF survey dossiers. |
| [`LiveLocationBar.tsx`](file:///d:/landmesure/src/components/LiveLocationBar.tsx) | GPS status banner displaying live coordinate telemetry, accuracy radius, and error states. |
| [`UnitSelector.tsx`](file:///d:/landmesure/src/components/UnitSelector.tsx) | Unit switcher component with active highlight animations. |
| [`geodesic.ts`](file:///d:/landmesure/src/services/geodesic.ts) | Core GeographicLib interface wrapping Karney's inverse, direct, and polygon-area algorithms. |
| [`areaCalculator.ts`](file:///d:/landmesure/src/services/areaCalculator.ts) | Boundary orchestration, self-intersection guard, edge measurement aggregation. |
| [`unitConverter.ts`](file:///d:/landmesure/src/services/unitConverter.ts) | Lossless floating-point conversion across international and regional land units. |

---

## 🚀 Local Development & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node v20+ recommended)
- **npm**: `v9.0.0` or higher

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/prasadborusu/LandMeasure.git

# 2. Navigate to project root
cd LandMeasure

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The app will be accessible at `http://localhost:5173`.

### Build for Production
```bash
npm run build
```
The optimized bundle will be generated in `dist/`.

---

## ⚖️ Legal Survey & Cadastral Disclaimer

> **IMPORTANT NOTICE**:
> 
> LandMeasure provides mathematical geospatial measurements based on user-supplied geographic coordinates. It is designed for **agricultural planning, spatial reference, architectural estimation, and land visualization**.
> 
> **It does NOT establish, certify, or substitute for legal cadastral boundaries or deed records.**
> 
> For official property boundaries, boundary disputes, deed registration, or construction permits, always consult a **licensed professional land surveyor** utilizing survey-grade **RTK GNSS hardware** and official government survey records.

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
