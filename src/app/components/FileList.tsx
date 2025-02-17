"use client";
import React, { useEffect, useState } from "react";

interface FileItem {
  filename: string;
  size?: number;
  createdAt?: string;
  // Additional fields can be added if needed, e.g. size, createdAt, etc.
}

interface SearchQuery {
  filename: string;
  extensions: string[];
}

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    filename: "",
    extensions: [],
  });

  const listFilesApi = (process.env.FILE_SERVER_API || "") + "/api/files";
  const downloadApi = (process.env.FILE_SERVER_API || "") + "/api/download";
  const searchFilesApi = (process.env.FILE_SERVER_API || "") + "/api/search";

  async function searchFiles() {   
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(searchFilesApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchQuery),
      });
      if (!res.ok) {
        throw new Error(`Error searching files: ${res.statusText}`);
      }
      const jsonData = await res.json();
      const data = jsonData.map((item: any) => ({
        filename: item.filename,
        size: item.size,
        createdAt: item.created_at,
        // Add more fields here if needed
      }));
      setFiles(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFiles() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(listFilesApi); // Adjust this URL to match your API endpoint.
      if (!res.ok) {
        throw new Error(`Error fetching files: ${res.statusText}`);
      }
      const jsonData = await res.json();
      const data = jsonData.map((item: any) => ({
        filename: item.filename,
        size: item.size,
        createdAt: item.created_at,
        // Add more fields here if needed
      }));
      setFiles(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div>
      <p>Click on a file to download:</p>
      <hr />
      {loading && <p>Loading files...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {files.length === 0 && !loading ? (
        <p>No files uploaded yet.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          {/* add search bar here to search for files   */}
          <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
            <label className="text-sm text-gray-700 dark:text-gray-400">
              Search Files:
            </label>
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 p-1 rounded-md"
              placeholder="Search files..."
              onChange={(e) => {
                setSearchQuery({ ...searchQuery, filename: e.target.value });
              }}
            />
            {/* text box to type extensions to search for */}
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 p-1 rounded-md"
              placeholder="Extensions..., e.g. pdf, docx"
              onChange={(e) => {
                setSearchQuery({
                  ...searchQuery,
                  extensions: e.target.value.split(",").map((ext) => ext.trim()),
                });
              }
              }
            />
            <button className="bg-blue-500 text-white p-1 rounded-md ml-2" onClick={searchFiles}>
              Search
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Total files: {files.length}
            </p>
          </div>
          <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3">
                  File Name
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3">
                  Size
                </th>
                <th scope="col" className="px-4 py-2 md:px-6 md:py-3">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.filename}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                >
                  <td
                    scope="row"
                    className="px-4 py-2 md:px-6 md:py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <a href={`${downloadApi}/${file.filename}`}>
                      {file.filename}
                    </a>
                  </td>
                  <td
                    scope="row"
                    className="px-4 py-2 md:px-6 md:py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {file.size
                      ? `${(file.size / 1024 / 1024).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} MB`
                      : "-"}
                  </td>
                  <td
                    scope="row"
                    className="px-4 py-2 md:px-6 md:py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {file.createdAt
                      ? new Date(file.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={fetchFiles}
        style={{
          marginTop: "1rem",
          textDecoration: "underline",
          color: "yellow",
        }}
      >
        Refresh List
      </button>
    </div>
  );
}
