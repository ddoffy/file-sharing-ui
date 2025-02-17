"use client"

import React from "react";
import { useSearchParams } from "next/navigation";
import Clipboard from "../components/Clipboard";
import Link from "next/link";
import { Suspense } from "react";

function ClipboardContents() {
  const searchParams = useSearchParams();
  const room_id = decodeURIComponent(searchParams.get("room_id"));
  const room_name = decodeURIComponent(searchParams.get("room_name"));

  if (!room_id || !room_name) {
    return <p>Invalid room</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <main className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <div className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <Link
            href="/clipboard-rooms"
            passHref
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            Go back to clipboard rooms
          </Link>
        </div>
        <h1>Clipboard Contents</h1>
        <p>Here you can view and manage your clipboard contents.</p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gray-50 dark:bg-gray-800 dark:text-gray-200 p-4 rounded-lg shadow-lg">
          {room_name}
        </h1>
        <Clipboard room_id={room_id} room_name={room_name} />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Link
          href="/clipboard-rooms"
          passHref
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Go back to clipboard rooms
        </Link>
      </footer>
    </div>
  );
}

export default function ClipboardPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ClipboardContents />
    </Suspense>
    )
}
