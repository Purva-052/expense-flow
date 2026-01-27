import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export interface ExcelPreviewData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

interface ExcelImportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExcelPreviewData | null;
  fileName: string;
  isLoading?: boolean;
  onConfirm: () => Promise<void>;
}

export const ExcelImportPreview: React.FC<ExcelImportPreviewProps> = ({
  open,
  onOpenChange,
  data,
  fileName,
  isLoading = false,
  onConfirm,
}) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(100);

  const handleConfirm = async () => {
    setIsUploading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsUploading(false);
    }
  };

  const totalRows = data?.rows?.length || 0;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows =
    data?.rows?.slice(startIndex, startIndex + pageSize) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Excel Preview</DialogTitle>
          <DialogDescription>
            Review the data from{" "}
            <span className="font-semibold">{fileName}</span> before importing
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            <div className="flex-1 min-h-[300px] overflow-auto border rounded-md relative">
              <Table className="min-w-max w-full">
                <TableHeader className="sticky top-0 bg-white shadow-sm z-20">
                  <TableRow>
                    {data.headers.map((header, index) => (
                      <TableHead
                        key={index}
                        className="whitespace-nowrap px-4 font-bold text-slate-900 border-b"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-slate-50">
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          className="whitespace-nowrap px-4 border-b"
                        >
                          {cell === null || cell === undefined
                            ? "-"
                            : String(cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 py-2 border-t text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + pageSize, totalRows)} of {totalRows}{" "}
                  rows
                </span>
                <select
                  className="bg-transparent border rounded p-1 text-xs"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={200}>200 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8 flex-1">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!data || isUploading || data.rows.length === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
