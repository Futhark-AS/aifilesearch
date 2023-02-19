import React from "react";
import { PlainNavbar } from "../components";

export const About = () => {
  return (
    <main className="container mx-auto flex min-h-screen w-full flex-col p-4 md:w-[70ch]">
      <PlainNavbar />

      <h1 className="mt-8 text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
        DocuSearch
      </h1>

      <div className="mt-2 block">
        With DocuSearch, you can search for information within all types of
        files, including PDFs, Word documents, Excel spreadsheets, and more. Our
        algorithm uses cutting-edge technology to understand the context of your
        search and deliver the most relevant results. Whether you&#39;re a
        student, a professional, or just someone who wants to be more organized,
        DocuSearch is here to make your life easier.
      </div>
      <div className="mt-4">
        We understand the importance of privacy and security, which is why all
        of your data is stored securely on our servers and is only accessible by
        you. Our user-friendly interface is intuitive and easy to use, so you
        can quickly find what you&#39;re looking for without any hassle.
      </div>
      <div className="mt-4">
        So why waste your time searching for information the old-fashioned way?
        Try DocuSearch today and experience the benefits of a smarter, more
        efficient search process
      </div>
      <h3 className="mt-8 text-xl font-bold">Examples</h3>
      <div className="mt-4">
        <div className="w-full bg-amber-100 py-4 mt-8 ">
          <div className="mx-auto w-8/12">
            <span className="text-lg">1. </span>A student searching for
            information on a specific topic for their research paper can use
            natural language queries such as &quot;effects of global warming on
            the Arctic&quot; and receive accurate results from a variety of
            sources within their uploaded files.
          </div>
        </div>
        <div className="w-full bg-green-100 py-4 mt-8 ">
          <div className="mx-auto w-8/12">
            <span className="text-lg">2. </span>A professional looking for data
            in spreadsheets can search using terms like &quot;sales revenue Q3
            2022&quot; and instantly access the relevant Excel files and cells.
          </div>
        </div>

        <div className="w-full bg-rose-100 py-4 mt-8 ">
          <div className="mx-auto w-8/12">
            <span className="text-lg">3. </span>
            An individual trying to find a specific email or document they need
            can search using phrases like &quot;invitation to company
            picnic&quot; or &quot;resume submitted for job application&quot; and
            quickly find what they are looking for without scrolling through
            countless folders.
          </div>
        </div>

        <div className="my-8">
          With DocuSearch, the possibilities are endless and the search process
          has never been more efficient or accurate
        </div>
      </div>
    </main>
  );
};
