"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";

export default function Clipboard(props: { room_id: string, room_name: string }) {
  
  const { sendMessage, messages } = useWebSocket();

  // we get the room id from props of the component
  const { room_id, room_name } = props;
  const storeClipboardApi =
    (process.env.FILE_SERVER_API || "") + `/api/v1/clipboard/${room_id}/store`;
  const clipbardContentApi =
    (process.env.FILE_SERVER_API || "") + `/api/v1/clipboard/${room_id}/get`;

  // state to store the clipboard text
  const [clipboardText, setClipboardText] = useState<string>("");
  // state to store the error message
  const [error, setError] = useState<string | null>(null);
  // state to store the loading status
  const [loading, setLoading] = useState<boolean>(false);
  // list of clipboard items
  const [clipboardItems, setClipboardItems] = useState<string[]>([]);
  // state to store the copied text
  const [copyText, setCopyText] = useState<string>("");

  // function to save the clipboard text
  const saveClipboard = async () => {
    setLoading(true);
    // check if the clipboard text is empty
    if (!clipboardText) {
      return;
    }

    // make a POST request to save the clipboard text
    try {
      const res = await fetch(storeClipboardApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: clipboardText, room_id, room_name }),
      });
      if (!res.ok) {
        setError(`Error saving clipboard: ${res.statusText}`);
        throw new Error(`Error saving clipboard: ${res.statusText}`);
      }
      // clear the clipboard text after saving
      setClipboardText("");
      // get the updated clipboard items
      getClipboard();
      sendMessage(room_id);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      console.error(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // function to get the clipboard text
  const getClipboard = async () => {
    setLoading(true);

    // make a GET request to get the clipboard text
    try {
      const res = await fetch(clipbardContentApi);
      if (!res.ok) {
        setError(`Error getting clipboard: ${res.statusText}`);
        throw new Error(`Error getting clipboard: ${res.statusText}`);
      }
      const jsonData = await res.json();
      setClipboardItems(jsonData);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      console.error(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // load the clipboard items on component mount
  useEffect(() => {
    getClipboard();
    handleStateChange(messages.at(-1));
  }, [messages]);

  // handle state change
  const handleStateChange = (msg: any) => {
    console.log("handleStateChange: ", msg);
    if (msg && !msg.startsWith("joined")) {
      console.log("msg + room_id: ", msg, room_id);
      if (msg == room_id) {
        console.log("refreshing clipboard");
        getClipboard();
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {loading && <p>Loading clipboard...</p>}
      {/* show error message if there is an error */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {/* we will have a input box with multiple line here to paste the text to be saved with the format */}
      <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
        <label className="text-sm text-gray-700 dark:text-gray-400">
          Clipboard text: 
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
          value={clipboardText}
          onChange={(e) => setClipboardText(e.target.value)}
        ></textarea>
        <button
          className="mt-2 p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md"
          onClick={saveClipboard}
        >
          Save
        </button>
      </div>
      {/* list of clipboard items
        on each item we will have a button to copy the text to clipboard
      */}
      <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-400 p-2">
        <label className="text-sm text-gray-700 dark:text-gray-400">
          Clipboard items:
        </label>
        <ul>
          {clipboardItems.map((item, index) => (
            <li key={index} className="flex items-center justify-between p-2">
              <span>{item}</span>
              <button
                className="border border-gray-300 dark:border-gray-700 p-1 rounded-md"
                onClick={() => {
                  navigator.clipboard.writeText(item);
                  setCopyText(item);
                }}
              >
                {/* copy button */}
                {copyText === item ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
