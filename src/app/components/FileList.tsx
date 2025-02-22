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
  page: number;
  limit: number;
}

interface SearchResult {
  files: FileItem[];
  total: number;
  page: number;
  limit: number;
}

export default function FileList() {
  const [searchResult, setSearchResult] = useState<SearchResult>({
    files: [],
    total: 0,
    page: 0,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    filename: "",
    extensions: [],
    page: 0,
    limit: 10,
  });
  const [extensionsSearch, setExtensionsSearch] = useState<string>("");

  const downloadApi = (process.env.FILE_SERVER_API || "") + "/api/download";
  const searchFilesApi = (process.env.FILE_SERVER_API || "") + "/api/search";

  async function searchFiles(query: SearchQuery) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(searchFilesApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });
      if (!res.ok) {
        throw new Error(`Error searching files: ${res.statusText}`);
      }
      const jsonData = await res.json();
      setSearchResult(jsonData);
      setTotalPages(Math.ceil(jsonData.total / query.limit));
    }
    catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function resetSearch() {
    setSearchQuery({ filename: "", extensions: [], page: 0, limit: 10 });
    setExtensionsSearch("");
    searchFiles(searchQuery);
  }

  async function previousPage() {
    setSearchQuery((previousQuery) => ({
      ...previousQuery,
      page: previousQuery.page - 1,
    }));
    console.log("searchQuery", searchQuery);
    searchFiles(searchQuery);
  }

  async function nextPage() {
    if (searchResult.total > searchQuery.page * searchQuery.limit) {
      setSearchQuery((previousQuery) => ({
        ...previousQuery,
        page: previousQuery.page + 1,
      }));
      console.log("searchQuery", searchQuery);
      searchFiles(searchQuery);
    }
  }

  useEffect(() => {
    searchFiles(searchQuery);
  }, [searchQuery]);

  return (
    <div>
      <p>Click on a file to download:</p>
      <hr />
      {loading && <p>Loading files...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div className="w-full max-w-md mx-auto">
        {/* add search bar here to search for files   */}
        <div className="w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
          <label className="text-sm text-gray-700 dark:text-gray-400">
            Search Files:
          </label>
          <br />
          <div className="text-sm text-gray-700 dark:text-gray-400 px-2 w-full max-w-md mx-auto">
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 p-1 rounded-md"
              placeholder="Search files..."
              value={searchQuery.filename}
              onChange={(e) => {
                setSearchQuery({ ...searchQuery, filename: e.target.value, page: 0, limit: 10});
              }}
            />
            {/* text box to type extensions to search for */}
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 p-1 rounded-md"
              placeholder="Extensions..., e.g. pdf, docx"
              value={extensionsSearch}
              onChange={(e) => {
                setExtensionsSearch(e.target.value);
                const extensions = e.target.value
                    .split(",")
                    .map((ext) => ext.trim())
                    .filter((ext) => ext.length > 2);
                if (extensions.length > 0) {
                  setSearchQuery({
                    ...searchQuery,
                    extensions: extensions,
                    page: 0,
                    limit: 10,
                  });
                }
              }}
            />
          </div>
          <br />
          <div className="w-full max-w-md max-auto text-sm text-gray-700 dark:text-gray-400">
            <button
              className="bg-blue-500 text-white p-1 rounded-md ml-2"
              onClick={() => searchFiles(searchQuery)}
            >
              Search
            </button>
            <button
              className="bg-blue-500 text-white p-1 rounded-md ml-2"
              onClick={resetSearch}
            >
              Reset
            </button>
          </div>
        </div>
        <hr />
        {/* show total number of files */}
        <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Total files: {searchResult.total}
          </p>
        </div>
        <hr />
        {/* add pagination here to show files in pages of 100 */}
        <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showing {searchQuery.limit} files per page
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Page: {Math.min((searchQuery.page + 1), totalPages)} of{" "}
            {totalPages}
          </p>
          {/* add next and previous buttons here to navigate through pages */}
          {
            <button
              className="bg-blue-500 text-white p-1 rounded-md ml-2"
              onClick={previousPage}
              disabled={searchQuery.page === 0}
            >
              Previous
            </button>
          }
          {
            <button
              className="bg-blue-500 text-white p-1 rounded-md ml-2"
              onClick={nextPage}
              disabled={searchQuery.page === totalPages - 1}
            >
              Next
            </button>
          }
        </div>
        <hr />
        {/* Table to display files */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
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
              {searchResult.files.map((file) => (
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
      </div>
    </div>
  );
}
