import { forwardRef } from "react";

interface BarcodeLabel {
  barcode: string;
  name: string;
  price: string;
}

interface BarcodePrintQueueProps {
  labels: BarcodeLabel[];
}

export const BarcodePrintQueue = forwardRef<HTMLDivElement, BarcodePrintQueueProps>(
  ({ labels }, ref) => {
    // Pad with empty labels to fill the page (24 labels per A4 page)
    const labelsPerPage = 24;
    const paddedLabels = [...labels];
    while (paddedLabels.length % labelsPerPage !== 0) {
      paddedLabels.push({ barcode: "", name: "", price: "" });
    }

    return (
      <div ref={ref} className="bg-white">
        {/* A4 page dimensions: 210mm x 297mm */}
        {/* 24 labels: 6 rows x 4 columns */}
        {Array.from({ length: Math.ceil(paddedLabels.length / labelsPerPage) }).map(
          (_, pageIndex) => (
            <div
              key={pageIndex}
              className="w-[210mm] h-[297mm] mx-auto bg-white relative"
              style={{
                pageBreakAfter: "always",
              }}
            >
              {/* Grid of 24 labels */}
              <div className="grid grid-cols-4 grid-rows-6 w-full h-full">
                {paddedLabels
                  .slice(pageIndex * labelsPerPage, (pageIndex + 1) * labelsPerPage)
                  .map((label, index) => (
                    <div
                      key={index}
                      className="border border-dashed border-gray-300 flex flex-col items-center justify-center p-2 relative"
                      style={{
                        width: "52.5mm",
                        height: "49.5mm",
                      }}
                    >
                      {label.barcode && (
                        <>
                          {/* Barcode Image */}
                          <img
                            src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
                              label.barcode
                            )}&scale=2&includetext&height=8`}
                            alt={`Barcode ${label.barcode}`}
                            className="w-full max-w-[45mm] mb-1"
                          />
                          {/* Product Name */}
                          <p className="text-[8px] font-semibold text-center line-clamp-2 w-full px-1">
                            {label.name}
                          </p>
                          {/* Price */}
                          <p className="text-[10px] font-bold text-center mt-0.5">
                            {label.price}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  }
);

BarcodePrintQueue.displayName = "BarcodePrintQueue";
