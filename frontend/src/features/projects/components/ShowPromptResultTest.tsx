import React from "react"
import { PromptMatch } from "../requests"
import { PdfViewer } from '../../../components/PdfViewer/PdfViewer';
import pdf from "@/assets/test-pdf.pdf"
const matches: PromptMatch[] = [
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_17",
        "score": 0.76809293,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.3045,
                        "y": 1.8148
                    },
                    {
                        "x": 6.3772,
                        "y": 1.8148
                    },
                    {
                        "x": 6.3772,
                        "y": 2.0967
                    },
                    {
                        "x": 1.3045,
                        "y": 2.0967
                    }
                ]
            ],
            "content": "Særlig om arbeidstaker som har inngått forvaltningskontrakt med Norsk Filmforbund (NFF/FoR)",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 3
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_6",
        "score": 0.766878724,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.3001,
                        "y": 2.8721
                    },
                    {
                        "x": 4.4289,
                        "y": 2.8721
                    },
                    {
                        "x": 4.4289,
                        "y": 3.1274
                    },
                    {
                        "x": 1.3001,
                        "y": 3.1274
                    }
                ]
            ],
            "content": "Arbeidstakers navn: Henrik Johannes Bjørnstad Skog 01.11.2001",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 2
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_32",
        "score": 0.762537122,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.003,
                        "y": 6.5431
                    },
                    {
                        "x": 7.1972,
                        "y": 6.5431
                    },
                    {
                        "x": 7.1972,
                        "y": 7.5809
                    },
                    {
                        "x": 1.003,
                        "y": 7.5809
                    }
                ]
            ],
            "content": "Esta falta de recurso puede ser especialmente frustrante para los usuarios que son nuevos en el mundo de las criptomonedas y no están familiarizados con los detalles técnicos de su funcionamiento. También puede ser un problema para los usuarios que son objetivo de estafadores o piratas informáticos, ya que no existe una autoridad central a la que denunciar el problema o pedir una indemnización.",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/test-pdf.pdf",
            "page_number": 6
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_5",
        "score": 0.76110667,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.3009,
                        "y": 2.5562
                    },
                    {
                        "x": 4.3886,
                        "y": 2.5562
                    },
                    {
                        "x": 4.3886,
                        "y": 2.6811
                    },
                    {
                        "x": 1.3009,
                        "y": 2.6811
                    }
                ]
            ],
            "content": "Norsk rikskringkasting AS (heretter benevnt NRK) og",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 2
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_74",
        "score": 0.759598136,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 0.9846,
                        "y": 7.3328
                    },
                    {
                        "x": 7.1921,
                        "y": 7.3328
                    },
                    {
                        "x": 7.1921,
                        "y": 7.6948
                    },
                    {
                        "x": 0.9846,
                        "y": 7.6948
                    }
                ]
            ],
            "content": "https://www.jpmorganchase.com/news-stories/could-blockchain-have-great-impact-as-intern et -",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/test-pdf.pdf",
            "page_number": 13
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_2",
        "score": 0.754899621,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.7472,
                        "y": 8.4579
                    },
                    {
                        "x": 5.3509,
                        "y": 8.4579
                    },
                    {
                        "x": 5.3509,
                        "y": 8.603
                    },
                    {
                        "x": 1.7472,
                        "y": 8.603
                    }
                ]
            ],
            "content": "• Alle originaldokumenter med signaturer på hver side",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 1
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_13",
        "score": 0.753751338,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.3002,
                        "y": 8.2452
                    },
                    {
                        "x": 6.2258,
                        "y": 8.2452
                    },
                    {
                        "x": 6.2258,
                        "y": 8.5283
                    },
                    {
                        "x": 1.3002,
                        "y": 8.5283
                    }
                ]
            ],
            "content": "Ved feilutbetaling av lønn og feriepenger kan NRK foreta nødvendig justering ved senere lønnsutbetalinger etter reglene i Arbeidsmiljøloven (aml.) § 14-15 nr. (2) c.",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 2
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_7",
        "score": 0.753317356,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.3013,
                        "y": 3.6623
                    },
                    {
                        "x": 6.9243,
                        "y": 3.6623
                    },
                    {
                        "x": 6.9243,
                        "y": 3.9454
                    },
                    {
                        "x": 1.3013,
                        "y": 3.9454
                    }
                ]
            ],
            "content": "Henrik Johannes Bjørnstad Skog ansettes som Ingeniør, kode 04-02, i 100 % stilling. Henrik Johannes Bjørnstad Skog er ansatt i NRK AS.",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 2
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_8",
        "score": 0.752033293,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.3013,
                        "y": 4.1364
                    },
                    {
                        "x": 5.6712,
                        "y": 4.1364
                    },
                    {
                        "x": 5.6712,
                        "y": 4.4195
                    },
                    {
                        "x": 1.3013,
                        "y": 4.4195
                    }
                ]
            ],
            "content": "Stillingen er lagt til Teknologi-, produkt- og produksjonsdivisjonen, Medieflyt. Din nærmeste leder er Taria Sivalingam.",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 2
        }
    },
    {
        "id": "sid:eb29ffbd4835f17f59814309696889de/michael_18",
        "score": 0.751660824,
        "metadata": {
            "bounding_box": [
                [
                    {
                        "x": 1.2998,
                        "y": 2.1317
                    },
                    {
                        "x": 6.9514,
                        "y": 2.1317
                    },
                    {
                        "x": 6.9514,
                        "y": 3.3632
                    },
                    {
                        "x": 1.2998,
                        "y": 3.3632
                    }
                ]
            ],
            "content": "Dersom arbeidstaker har inngått en avtale (forvaltningskontrakt) med NFF/FoR for sine opphavsrettigheter, er partene enige om at avtalen ikke begrenser NRKs rett til å disponere over arbeidstakerens arbeidsresultater og opphavsrettigheter i kraft av dette ansettelsesforholdet og kapittel 15 i NRKs tariffavtaler. Arbeidstaker plikter å informere NFF om at arbeidstaker selv vil forvalte de rettighetene som er nødvendig for å oppfylle denne arbeidsavtalen. Arbeidstaker er kjent med at lønnen etter denne arbeidsavtalen inkluderer vederlag for overføring av rettighetene. For å unngå dobbel betaling for overføring av rettighetene er arbeidstaker, eller NFF/FoR på vegne av arbeidstaker, ikke berettiget til ytterligere vederlag for rettighetsoverdragelsen utover det som er inkludert i lønnen.",
            "file_name": "sid:eb29ffbd4835f17f59814309696889de/michael/Arbeidsavtale - signert 03.11.2022.pdf",
            "page_number": 3
        }
    }
]
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
    const cryptoTextFile = "https://nlpsearchapi.blob.core.windows.net/users/sid%3Aeb29ffbd4835f17f59814309696889de/michael/test-pdf.pdf?st=2023-01-21T10%3A43%3A20Z&se=2023-01-21T12%3A43%3A20Z&sp=r&sv=2018-03-28&sr=b&sig=9ywSHjL7rgnvcWHHuQYaiyNQsb3cPV%2BS5ygiZVmcu6A%3D"
    return (
        <PdfViewer file={pdf} promptResult={matches[2]}/>
    )
}