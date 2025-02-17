"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ClipboardRoomInfo {
  room_id: string;
  room_name: string;
}

export default function ClipboardRooms() {
  const router = useRouter();
  const clipboardRoomsApi =
    (process.env.FILE_SERVER_API || "") + "/api/v1/clipboard/keys";

  const [rooms, setRooms] = useState<ClipboardRoomInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<ClipboardRoomInfo>({
    room_id: Math.random().toString(36).substring(2, 15),
    room_name: ""
    });

  const getClipboardRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(clipboardRoomsApi);
      if (!res.ok) {
        throw new Error(`Error getting clipboard rooms: ${res.statusText}`);
      }
      const jsonData = await res.json();
      setRooms(jsonData);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClipboardRooms();
  }, []);

  const createNewRoom = () => {
    const roomIdEncoded = encodeURIComponent(room.room_id);
    const roomNameEncoded = encodeURIComponent(room.room_name);
    router.push(`/clipboard?room_id=${roomIdEncoded}&room_name=${roomNameEncoded}`);
  };

  const buildHrefForRoom = (path: string, item: ClipboardRoomInfo) => {
    const roomIdEncoded = encodeURIComponent(item.room_id);
    const roomNameEncoded = encodeURIComponent(item.room_name);
    return `${path}?room_id=${roomIdEncoded}&room_name=${roomNameEncoded}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <main className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <div className="w-full overflow-x-auto px-4 py-6">
          <h1>Clipboard Rooms</h1>
          <p>Here you can view and manage your clipboard rooms.</p>
          <br />
          <input
            type="text"
            placeholder="Enter room name"
            className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md"
            value={room.room_name}
            onChange={(e) => setRoom({ ...room, room_name: e.target.value })}
          />
          <button
            className="px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700 dark:hover:bg-blue-600"
            onClick={createNewRoom}
            >
            Create Room
          </button>
        </div>
        <br />
        {loading && <p>Loading rooms...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        <div className="w-full max-w-md mx-auto">
          {rooms.length > 0 && !loading && !error && (
            // make this list look better with colorful buttons and icons
            // and bigger text
            <ul>
              {rooms.map((item) => (
                <li key={item.room_id} className="mb-4 w-full">
                  <Link
                    href={buildHrefForRoom("/clipboard", item)}
                    passHref
                    className="px-4 py-6"
                  >
                    <button className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700 dark:hover:bg-blue-600">
                      {item.room_name}
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Link
          href="/"
          passHref
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Back to Home
        </Link>
      </footer>
    </div>
  );
}
