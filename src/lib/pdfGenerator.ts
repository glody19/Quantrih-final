import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const generatePDFReport = async (
  elementId: string, 
  filename: string, 
  onProgress?: (progress: boolean) => void
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  if (onProgress) onProgress(true);

  try {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const canvas = await toCanvas(element, {
      pixelRatio: 2, 
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add 10mm margins
    const margin = 10;
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = pdfHeight - (2 * margin);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin;
    let page = 1;
    const totalPages = Math.ceil(imgHeight / contentHeight);

    const addHeaderFooter = (pageNum: number) => {
      // Draw white rectangles to cover anything overlapping the top and bottom margins
      pdf.setFillColor(isDark ? 15 : 255, isDark ? 23 : 255, isDark ? 42 : 255);
      pdf.rect(0, 0, pdfWidth, margin, 'F'); // Top margin
      pdf.rect(0, pdfHeight - margin, pdfWidth, margin, 'F'); // Bottom margin

      pdf.setFontSize(9);
      pdf.setTextColor(isDark ? 200 : 100);
      pdf.setFont("helvetica", "normal");
      
      const humanFilename = filename.replace(/_/g, ' ');
      // Title
      pdf.text(`Quantrih - ${humanFilename}`, margin, margin - 3);
      
      // Page Number
      pdf.text(`Page ${pageNum} / ${totalPages}`, pdfWidth - margin - 20, pdfHeight - margin + 5);
      
      // Date generated
      pdf.text(`${new Date().toLocaleDateString()}`, margin, pdfHeight - margin + 5);
    };

    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
    addHeaderFooter(page);
    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = position - contentHeight;
      pdf.addPage();
      page++;
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      addHeaderFooter(page);
      heightLeft -= contentHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    if (onProgress) onProgress(false);
  }
};
