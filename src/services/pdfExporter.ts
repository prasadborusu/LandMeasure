import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LatLngPoint, MeasurementResultData, MapLayerType } from '../types/measurement';
import { convertArea, formatCoordinate, formatNumber } from './unitConverter';
import { generateMapSnapshot } from './mapSnapshot';

export async function exportMeasurementPdf(
  points: LatLngPoint[],
  result: MeasurementResultData,
  title: string = 'Land Measurement Report',
  layer: MapLayerType = 'satellite'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const units = convertArea(result.areaM2);

  // --- HEADER SECTION ---
  doc.setFillColor(22, 163, 74); // Forest green accent #16a34a
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LAND MEASUREMENT REPORT', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('WGS84 Geodesic Ellipsoidal Surveying', 14, 19);

  const reportDate = new Date().toLocaleString();
  doc.setFontSize(8);
  doc.text(`Generated: ${reportDate}`, pageWidth - 14, 15, { align: 'right' });

  // --- SUMMARY CARDS ---
  let curY = 30;

  // Background box for primary area
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, curY, 86, 24, 2, 2, 'FD');
  doc.roundedRect(108, curY, 88, 24, 2, 2, 'FD');

  // Left card: Area in Acres & m²
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL LAND AREA', 20, curY + 5.5);

  doc.setTextColor(21, 128, 61); // Green 700
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatNumber(units.acres, 3)} Acres`, 20, curY + 13);

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNumber(result.areaM2, 2)} m²`, 20, curY + 19);

  // Right card: Perimeter & Cents
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BOUNDARY PERIMETER & CENTS', 114, curY + 5.5);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatNumber(result.perimeterM, 2)} meters`, 114, curY + 13);

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNumber(units.cents, 2)} Cents  •  ${formatNumber(units.hectares, 4)} Hectares`, 114, curY + 19);

  curY += 28;

  // --- METHODOLOGY & PARAMETERS PANEL ---
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, curY, pageWidth - 28, 17, 2, 2, 'F');

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Measurement Methodology', 18, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Method: WGS84 Geodesic (Karney / GeographicLib)', 18, curY + 10);
  doc.text('Datum: WGS84 Ellipsoid  |  Semi-major axis: a = 6,378,137.0 m  |  Flattening: f = 1/298.257223563', 18, curY + 14.5);

  curY += 22;

  // --- REAL SATELLITE / MAP SATELLITE IMAGE EMBEDDING ---
  if (points.length >= 3) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text('Satellite / Map Parcel Imagery', 14, curY);

    const diagramX = 14;
    const diagramY = curY + 2.5;
    const diagramW = pageWidth - 28;
    const diagramH = 56;

    try {
      // Generate actual satellite imagery with polygon & distance overlay
      const mapImgData = await generateMapSnapshot(points, layer, 1000, 500);
      doc.addImage(mapImgData, 'JPEG', diagramX, diagramY, diagramW, diagramH);
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.3);
      doc.rect(diagramX, diagramY, diagramW, diagramH);
    } catch {
      // Fallback clean vector schematic if offline
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(diagramX, diagramY, diagramW, diagramH, 'FD');

      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const latSpan = Math.max(maxLat - minLat, 0.00001);
      const lngSpan = Math.max(maxLng - minLng, 0.00001);

      const pad = 8;
      const drawW = diagramW - pad * 2;
      const drawH = diagramH - pad * 2;

      const screenPoints = points.map((p) => {
        const x = diagramX + pad + ((p.lng - minLng) / lngSpan) * drawW;
        const y = diagramY + pad + (1 - (p.lat - minLat) / latSpan) * drawH;
        return { x, y };
      });

      doc.setFillColor(220, 252, 231);
      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(0.6);

      for (let i = 0; i < screenPoints.length; i++) {
        const nextIdx = (i + 1) % screenPoints.length;
        doc.line(
          screenPoints[i].x,
          screenPoints[i].y,
          screenPoints[nextIdx].x,
          screenPoints[nextIdx].y
        );
      }

      screenPoints.forEach((sp, idx) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.5);
        doc.circle(sp.x, sp.y, 2.2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(21, 128, 61);
        doc.text(String(idx + 1), sp.x, sp.y + 0.8, { align: 'center' });
      });
    }

    curY = diagramY + diagramH + 5;
  }

  // --- BOUNDARY POINTS & DISTANCES TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  doc.text('Boundary Points & Coordinates', 14, curY);

  const tableBody = points.map((p, idx) => {
    const nextIdx = (idx + 1) % points.length;
    const edge = result.edges.find((e) => e.fromIndex === idx);
    const edgeText = `P${idx + 1} -> P${nextIdx + 1}`;
    const distText = edge ? `${formatNumber(edge.distanceMeters, 2)} m` : '--';

    return [
      `P${idx + 1}`,
      formatCoordinate(p.lat) + '°',
      formatCoordinate(p.lng) + '°',
      edgeText,
      distText,
    ];
  });

  autoTable(doc, {
    startY: curY + 2,
    head: [['Vertex', 'Latitude (WGS84)', 'Longitude (WGS84)', 'Segment', 'Distance (m)']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 14, right: 14 },
  });

  // Position after table
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable?.finalY || curY + 36;

  // --- ACCURACY DISCLAIMER & FOOTER ---
  const disclaimerY = Math.min(finalY + 6, pageHeight - 28);

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, disclaimerY, pageWidth - 28, 16, 1.5, 1.5, 'FD');

  doc.setTextColor(153, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('IMPORTANT — LEGAL SURVEY DISCLAIMER:', 18, disclaimerY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(127, 29, 29);
  const disclaimerText =
    'This application provides mathematical geospatial measurements based on the geographic coordinates supplied to it. It is intended for estimation, planning, land measurement and spatial reference. It does not establish or certify legal property boundaries. For legal property boundaries, cadastral work, registration, disputes, construction or official surveying, consult an authorized land surveyor and use appropriate survey-grade equipment and official records.';
  doc.text(disclaimerText, 18, disclaimerY + 8, { maxWidth: pageWidth - 36 });

  // Save / Download PDF
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  doc.save(`${safeTitle}.pdf`);
}
