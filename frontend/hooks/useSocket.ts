"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();
  const userId = (session as any)?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", userId);
    });

    socket.on("budget:warning", (data) => {
      if (data.isExceeded) {
        toast.error(
          `Budget ${data.categoryName} sudah terlampaui! (${data.usagePercent}%)`,
          { duration: 6000 },
        );
      } else {
        toast.warning(
          `Budget ${data.categoryName} hampir habis! (${data.usagePercent}%)`,
          { duration: 6000 },
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket dosconnected");
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);
  return { socket: socketRef.current };
}
