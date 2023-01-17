import React from "react"
import { ShowPromptResult } from "./ShowPromptResult"
const testData = {
    "file": "http://localhost:5173/public/test-pdf.pdf",
    "promptResult": {
        "id": "1",
        "score": 0.5,
        "metadata": {
            "page_number": 6,
            "bounding_box": [
                [
                    {
                        "x": 1,
                        "y": 1
                    }
                ]
            ],
            "file_name": "file1",
            "content": "content1"
        }
    }
}

export function TestShowPromptResult() {
    return (
        <ShowPromptResult file={testData.file} promptResult={testData.promptResult}/>
    )
}