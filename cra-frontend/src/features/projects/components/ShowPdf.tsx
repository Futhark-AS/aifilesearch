import React, { useState } from "react";
import { PDFViewer } from "@/components/PdfViewer";

export function ShowPdf() {
    const [file, setFile] = useState<string | File>("/sample.pdf");
    function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
      if(!event.target.files || event.target.files.length === 0) return
      setFile(event.target.files[0]);
    }

    return (
      <div>
        <div>
          <label htmlFor="file">Load from file:</label>
          <input onChange={onFileChange} type="file" />
        </div>
        <div>
        <PDFViewer file={file}/>
        </div>
      </div>
    );
  }