import React, { useState } from "react";
import { Button } from "@mantine/core";
import axios from "axios";
import { useParams } from "react-router-dom";

//TODO: get file from azure based on project.
const fetchFiles = async (id: string): Promise<File> => {
  const res = await axios.get(`/api/file/${id}`);
  return res.data as File;
};

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const FileCard = () => { return (
    <div className="flex flex-col rounded-lg bg-white p-4 shadow-lg">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">File name</h2>
          <p className="text-gray-500">File description</p>
          <p className="text-gray-500">File size</p>
          <p className="text-gray-500">File type</p>
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <Button color="red">Delete</Button>
      </div>
    </div>
  );
};

const EditProject = () => {
  const {id} = useParams<{id: string}>(); 
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <>
      <main className="container mx-auto flex min-h-screen w-[60ch] flex-col p-4">
        <section>
          <h2 className="text-left text-4xl font-extrabold leading-normal text-gray-700">
            Law search
          </h2>
          <p className="text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
          </p>
        </section>
        <section>
          <h3 className="text-2xl">All files</h3>
          <Button variant="outline" size="xs">
            New file
          </Button>
          <div className="auto-responsive grid">
            {cards.map((card, i) => (
              <FileCard key={i} />
            ))}
          </div>
        </section>
        <section>
          <div>
            {/* <PDFViewer /> */}
            <p>
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default EditProject
