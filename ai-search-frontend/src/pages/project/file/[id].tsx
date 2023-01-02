import { Button } from "@mantine/core";
import type { NextPage } from "next";
import Head from "next/head";
import HeaderResponsive from "../../../components/Header";
import { useRouter } from "next/router";
import axios from "axios";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(
  () => import('../../../components/PdfViewer'),
  { ssr: false }
);

const fetchFile = async (id: string): Promise<File> => {
  const res = await axios.get(`/api/file/${id}`);
  return res.data as File;
};

const Home: NextPage = () => {
  // function onFileChange(event) {
  //   setFile(event.target.files[0]);
  // }

  // function onDocumentLoadSuccess({ numPages: nextNumPages }) {
  //   setNumPages(nextNumPages);
  // }

  // return (
  //   <div>
  //     <div>
  //       <label htmlFor="file">Load from file:</label>{" "}
  //       <input onChange={onFileChange} type="file" />
  //     </div>
  //     <div>
  //       <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
  //         {Array.from({ length: numPages }, (_, index) => (
  //           <Page
  //             key={`page_${index + 1}`}
  //             pageNumber={index + 1}
  //             renderAnnotationLayer={false}
  //             renderTextLayer={false}
  //           />
  //         ))}
  //       </Document>
  //     </div>
  //   </div>
  // );
  const router = useRouter();
  const { id } = router.query;
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const [file, setFile] = useState<string>("/cv.pdf");

  return (
    <>
      <Head>
        <title>Project</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderResponsive
        links={[
          { label: "My Projects", link: "/projects" },
          { label: "Sign up", link: "/signup" },
        ]}
      />

      <main className="container mx-auto flex min-h-screen w-[60ch] flex-col p-4">
        <section>
          <h2 className="text-left text-4xl font-extrabold leading-normal text-gray-700">
            Law search
          </h2>
          <p className="text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
          </p>
        </section>
        <section className="mt-2">
          <Button variant="outline" size="xs">
            New file
          </Button>
        </section>
        <section>
          <div>
          <img src="/photo.jpg" />
          <PdfViewer url={file} width={600} pageNumber={pageNumber} />
            <p>
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
