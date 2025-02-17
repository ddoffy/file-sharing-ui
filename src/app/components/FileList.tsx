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
  page?: number;
  limit?: number;
}

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    filename: "",
    extensions: [],
    page: 0,
    limit: 100,
  });

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

  async function resetSearch() {
    setSearchQuery({ filename: "", extensions: [], page: 0, limit: 100 });
    searchFiles();
  }

  async function previousPage() {
    if (searchQuery.page && searchQuery.page > 1) {
      setSearchQuery({ ...searchQuery, page: (searchQuery.page || 1) - 1 });
      searchFiles();
    }
  }

  async function nextPage() {
    if (files.length > searchQuery.page * searchQuery.limit) {
      setSearchQuery({ ...searchQuery, page: (searchQuery.page || 1) + 1 });
      searchFiles();
    }
  }

  useEffect(() => {
    searchFiles();
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
        <div className="w-full max-w-md mx-auto">
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
                  extensions: e.target.value
                    .split(",")
                    .map((ext) => ext.trim()),
                });
              }}
            />
            <button
              className="bg-blue-500 text-white p-1 rounded-md ml-2"
              onClick={searchFiles}
            >
              Search
            </button>
            <button className="bg-blue-500 text-white p-1 rounded-md ml-2" onClick={resetSearch}>
              Reset
            </button>
          </div>
          <hr />
          {/* show total number of files */}
          <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Total files: {files.length}
            </p>
          </div>
          <hr />
          {/* add pagination here to show files in pages of 100 */}
          <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Showing {searchQuery.limit} files per page
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Page: {searchQuery.page || 1} of{" "}
              {Math.ceil(files.length / searchQuery.limit)}
            </p>
            {/* add next and previous buttons here to navigate through pages */}
            {searchQuery.page > 1 && (
              <button
                className="bg-blue-500 text-white p-1 rounded-md ml-2"
                onClick={previousPage}
              >
                Previous
              </button>
            )}
            {files.length > (searchQuery.page + 1) * searchQuery.limit && (
              <button
                className="bg-blue-500 text-white p-1 rounded-md ml-2"
                onClick={nextPage}
              >
                Next
              </button>
            )}
          </div>
          <hr />
          {/* Table to display files */}
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
    </div>
  );
}
