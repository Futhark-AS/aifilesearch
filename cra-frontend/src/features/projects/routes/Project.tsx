import React from "react";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { Button, Loader, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import axios from "axios";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Link, useParams } from "react-router-dom";

const LawSchema = z
  .object({
    law_name: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        similarities: z.number(),
        law_name: z.string(),
        chapter: z.string(),
        paragraph: z.string(),
        paragraph_title: z.string(),
        paragraph_body: z.string(),
      })
    ),
  })
  .transform((val) => {
    return {
      law_name: val.law_name,
      items: val.items.map((item) => ({
        id: item.id,
        similarities: item.similarities,
        law_name: item.law_name,
        chapter: item.chapter,
        paragraph: item.paragraph_body,
        paragraph_title: item.paragraph_title,
      })),
    };
  });

type Law = z.infer<typeof LawSchema>;

const Project = () => {
  const user = useAppSelector((state) => selectUser(state));
  const {id} = useParams<{id: string}>();

  const [searchValue, setSearchValue] = useState("");

  const [debouncedSearchValue] = useDebouncedValue(searchValue, 200);

  useEffect(() => {
    console.log(debouncedSearchValue);
  }, [debouncedSearchValue]);

  // TODO: get files from azure based on project. Should do this here and pass down maybe
  const [data, setData] = useState<{ results: Law[] }>({
    results: [
      {
        law_name: "Lov om skatt",
        items: [
          {
            id: "1",
            similarities: 0.5,
            law_name: "Lov om skatt",
            chapter: "§ 1-1",
            paragraph: "Dette er en paragraf",
            paragraph_title: "Paragraf 1",
          },
          {
            id: "2",
            similarities: 0.5,
            law_name: "Lov om skatt",
            chapter: "§ 1-2",
            paragraph: "Dette er en paragraf",
            paragraph_title: "Paragraf 2",
          },
        ],
      },
    ],
  });

  // TODO: make this work 
  async function normalSearch() {
    const prompt = "heihei";
    const topK = 3;
    const namespace = "";

    // https://nlp-search-api.azurewebsites.net/api/search
    // http://localhost:7071/api/search
    const data = await axios.get(
      `https://nlp-search-api.azurewebsites.net/api/search?id=${user.uid}&prompt=${prompt}&topK=${topK}&namespace=${namespace}`,
      {
        //const res = await fetch(`http://localhost:7071/api/search?id=${uid}&prompt=${prompt}&topK=${topK}&namespace=${namespace}`, {
        headers: {
          "Content-Type": "application/json",
          "X-ZUMO-AUTH": user.token,
          //no cors
          //'Access-Control-Allow-Origin': '*'
        },
      }
    );

    console.log(data.data);
  }

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
        <Button variant="outline" size="xs">
          <Link to={`edit`}>Edit project data</Link>
        </Button>

        <TextInput
          label="Search"
          placeholder="Eks: Hvor mye må jeg betale i skatt om jeg tjener 400 000?"
          className="input input-bordered mt-5 w-full"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          rightSection={<Loader size="sm" color="blue" />}
        />

        <section className="mt-10 flex w-full flex-col justify-center">
          <h3 className="text-xl">Resultater</h3>
          {data.results && data.results.length === 0 ? (
            <p className="text-gray-500">Ingen resultater</p>
          ) : (
            data.results.map((lawGroup, i1) => (
              <div key={i1}>
                <h1 className="mt-5 mb-2 text-left text-2xl font-semibold uppercase text-gray-700">
                  {lawGroup.law_name}
                </h1>
                {lawGroup.items.map((item, i) => (
                  <div
                    className="mx-auto mt-0 mb-5 w-full max-w-3xl overflow-hidden bg-slate-50 px-5 py-0"
                    key={i}
                  >
                    <div className="card-body">
                      <h3 className="card-subtitle">{item.chapter}</h3>
                      <p className="card-text">{item.paragraph_title}</p>
                      <p className="card-text">
                        {item.paragraph.length > 256
                          ? `${item.paragraph.slice(0, 256)}...`
                          : item.paragraph}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
};

export default Project;
