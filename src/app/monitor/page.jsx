"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const VIDEO_BUFFER_SECONDS = 15;
const AUDIO_BUFFER_SECONDS = 5;
const DETECTION_INTERVAL_MS = 1200;
const DETECTION_THRESHOLD = 0.7;

function chooseMimeType(candidates) {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return "";
  }
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function MonitorPage() {
  const router = useRouter();
  const [source, setSource] = useState("manual");
  const sourceRef = useRef("manual");

  const [status, setStatus] = useState("Initializing camera and microphone...");
  const [error, setError] = useState("");
  const [monitoring, setMonitoring] = useState(false);
  const [violenceProbability, setViolenceProbability] = useState(0);
  const [audioProbability, setAudioProbability] = useState(0);
  const [combinedProbability, setCombinedProbability] = useState(0);
  const [dispatchState, setDispatchState] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const detectionLockRef = useRef(false);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const analyserBufferRef = useRef(null);

  const stopEverything = () => {
    if (detectionTimerRef.current) {
      clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }

    if (videoRecorderRef.current && videoRecorderRef.current.state !== "inactive") {
      videoRecorderRef.current.stop();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
      audioRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    analyserBufferRef.current = null;
  };

  const startMonitoring = async (triggerSource = "manual") => {
    setError("");
    setDispatchState("");
    setStatus("Requesting camera and microphone permissions...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 360 } },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playError) {
          if (playError?.name !== "AbortError") {
            throw playError;
          }
        }
      }

      const nowSeconds = () => Date.now() / 1000;
      const videoMimeType = chooseMimeType(["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]);
      const audioMimeType = chooseMimeType(["audio/webm;codecs=opus", "audio/webm"]);

      const videoRecorder = new MediaRecorder(stream, videoMimeType ? { mimeType: videoMimeType } : undefined);
      videoRecorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0) return;
        videoChunksRef.current.push({ t: nowSeconds(), chunk: event.data });
        const cutoff = nowSeconds() - VIDEO_BUFFER_SECONDS;
        videoChunksRef.current = videoChunksRef.current.filter((entry) => entry.t >= cutoff);
      };
      videoRecorder.start(1000);
      videoRecorderRef.current = videoRecorder;

      const audioStream = new MediaStream(stream.getAudioTracks());
      const audioRecorder = new MediaRecorder(audioStream, audioMimeType ? { mimeType: audioMimeType } : undefined);
      audioRecorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0) return;
        audioChunksRef.current.push({ t: nowSeconds(), chunk: event.data });
        const cutoff = nowSeconds() - AUDIO_BUFFER_SECONDS;
        audioChunksRef.current = audioChunksRef.current.filter((entry) => entry.t >= cutoff);
      };
      audioRecorder.start(1000);
      audioRecorderRef.current = audioRecorder;

      if (stream.getAudioTracks().length > 0) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        sourceNode.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        analyserBufferRef.current = new Uint8Array(analyser.fftSize);
      }

      setMonitoring(true);
      setStatus("Monitoring for violence...");

      detectionTimerRef.current = setInterval(async () => {
        if (detectionLockRef.current || !videoRef.current) return;
        detectionLockRef.current = true;
        try {
          const frameCanvas = document.createElement("canvas");
          frameCanvas.width = videoRef.current.videoWidth || 640;
          frameCanvas.height = videoRef.current.videoHeight || 360;
          const ctx = frameCanvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(videoRef.current, 0, 0, frameCanvas.width, frameCanvas.height);

          const frameBlob = await new Promise((resolve) =>
            frameCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7)
          );
          if (!frameBlob) return;

          const frameDataUrl = await blobToDataUrl(frameBlob);
          const videoResult = await fetch("/api/violence-detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ frameDataUrl }),
          });

          if (!videoResult.ok) return;
          const videoDetection = await videoResult.json();
          const videoConfidence = Number(videoDetection.confidence || 0);
          setViolenceProbability(videoConfidence);

          let rms = 0;
          if (analyserRef.current && analyserBufferRef.current) {
            analyserRef.current.getByteTimeDomainData(analyserBufferRef.current);
            let sum = 0;
            for (let i = 0; i < analyserBufferRef.current.length; i += 1) {
              const normalized = (analyserBufferRef.current[i] - 128) / 128;
              sum += normalized * normalized;
            }
            rms = Math.sqrt(sum / analyserBufferRef.current.length);
          }

          const audioResult = await fetch("/api/audio-violence-detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rms, source: triggerSource }),
          });

          let audioConfidence = 0;
          let audioDetected = false;
          if (audioResult.ok) {
            const audioDetection = await audioResult.json();
            audioConfidence = Number(audioDetection.confidence || 0);
            audioDetected = Boolean(audioDetection.violenceDetected);
          }
          setAudioProbability(audioConfidence);

          const fusedConfidence = Math.max(
            videoConfidence,
            audioConfidence,
            videoConfidence * 0.7 + audioConfidence * 0.3
          );
          setCombinedProbability(fusedConfidence);

          const triggerDetected =
            (Boolean(videoDetection.violenceDetected) && videoConfidence >= DETECTION_THRESHOLD) ||
            (audioDetected && audioConfidence >= DETECTION_THRESHOLD) ||
            fusedConfidence >= DETECTION_THRESHOLD;

          if (triggerDetected) {
            setStatus("Violence detected. Preparing emergency evidence package...");
            setMonitoring(false);
            clearInterval(detectionTimerRef.current);
            detectionTimerRef.current = null;

            const videoBlob = new Blob(videoChunksRef.current.map((entry) => entry.chunk), {
              type: videoChunksRef.current[0]?.chunk?.type || "video/webm",
            });
            const audioBlob = new Blob(audioChunksRef.current.map((entry) => entry.chunk), {
              type: audioChunksRef.current[0]?.chunk?.type || "audio/webm",
            });

            const formData = new FormData();
            formData.append("video", videoBlob, "incident-15s.webm");
            formData.append("audio", audioBlob, "incident-audio.webm");
            formData.append("detectedConfidence", String(fusedConfidence));
            formData.append("videoConfidence", String(videoConfidence));
            formData.append("audioConfidence", String(audioConfidence));
            formData.append("source", triggerSource);
            formData.append("timestamp", new Date().toISOString());

            setDispatchState("Sending incident evidence to emergency contacts...");
            const dispatchResponse = await fetch("/api/emergency-dispatch", {
              method: "POST",
              body: formData,
            });

            const dispatchResult = await dispatchResponse.json();
            if (!dispatchResponse.ok) {
              const details =
                typeof dispatchResult.details === "string"
                  ? dispatchResult.details
                  : Array.isArray(dispatchResult.details)
                    ? dispatchResult.details.map((d) => `${d.to}: ${d.reason}`).join(" | ")
                    : "";
              throw new Error(
                `${dispatchResult.error || "Failed to dispatch emergency evidence."}${details ? ` ${details}` : ""}`
              );
            }

            setDispatchState("Evidence sent successfully to emergency channel.");
            setStatus("Monitoring paused after dispatch.");
          }
        } catch (scanError) {
          console.error(scanError);
        } finally {
          detectionLockRef.current = false;
        }
      }, DETECTION_INTERVAL_MS);
    } catch (err) {
      setError(err.message || "Unable to access camera/microphone.");
      setStatus("Monitoring not started.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolvedSource = params.get("source") || "manual";
    sourceRef.current = resolvedSource;
    setSource(resolvedSource);
    startMonitoring(resolvedSource);
    return () => stopEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1F3A] md:flex md:items-center md:justify-center md:p-4">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#0B1F3A] md:h-[844px] md:w-[390px] md:max-w-none md:rounded-[28px] md:border md:border-white/30 md:shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/20 bg-[#102A43] px-4 py-3 text-white">
          <button onClick={() => router.push("/")} className="text-sm font-medium text-white/90">
            Back
          </button>
          <h1 className="text-sm font-semibold tracking-wide">SOS Live Monitor</h1>
          <span className={`text-xs ${monitoring ? "text-[#FF7A00]" : "text-white/80"}`}>
            {monitoring ? "LIVE" : "IDLE"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 text-white">
          <div className="rounded-2xl border border-white/20 bg-black/30 p-2 shadow-lg">
            <video ref={videoRef} muted playsInline className="h-[260px] w-full rounded-xl bg-black object-cover" />
          </div>

          <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm text-white/90">{status}</p>
            <p className="mt-2 text-sm text-white/80">
              Video probability: <span className="font-semibold text-white">{Math.round(violenceProbability * 100)}%</span>
            </p>
            <p className="mt-1 text-sm text-white/80">
              Audio probability: <span className="font-semibold text-white">{Math.round(audioProbability * 100)}%</span>
            </p>
            <p className="mt-1 text-sm text-white/80">
              Combined probability: <span className="font-semibold text-white">{Math.round(combinedProbability * 100)}%</span>
            </p>
            <p className="mt-1 text-xs text-white/70">
              Source: <span className="font-medium text-white/90">{source}</span>
            </p>
            {dispatchState && <p className="mt-3 text-sm font-medium text-[#FF7A00]">{dispatchState}</p>}
            {error && <p className="mt-3 text-sm font-medium text-[#FFB3B8]">{error}</p>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => startMonitoring(sourceRef.current)}
              className="rounded-xl bg-[#FF7A00] px-4 py-3 text-sm font-semibold text-white"
            >
              Restart Monitoring
            </button>
            <button
              onClick={() => {
                stopEverything();
                router.push("/");
              }}
              className="rounded-xl bg-[#C1121F] px-4 py-3 text-sm font-semibold text-white"
            >
              Stop Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
