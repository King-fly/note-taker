import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseAudioRecorderOptions {
  onTranscriptionComplete?: (text: string) => void;
  t: (key: string, options?: any) => string; // 接收翻译函数
}

export function useAudioRecorder({ onTranscriptionComplete, t }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordTime, setRecordTime] = useState("00:00");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranscriptionComplete, setIsTranscriptionComplete] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>("");
  const finalTextRef = useRef<string>("");

  const processAudioAndTranscribe = useCallback(async () => {
    setIsTranscribing(true);
    setTranscription(t("home.recognizingSpeech"));
    setIsTranscriptionComplete(false);

    try {
      const mimeType = mimeTypeRef.current || "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type: mimeType });

      if (blob.size === 0) {
        toast.error(t("home.emptyRecordingError"));
        setIsTranscribing(false);
        setTranscription("");
        return;
      }

      console.log("[Recorder] Audio blob:", blob.size, "bytes");

      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);

      console.log("[Recorder] Base64 length:", base64.length);

      const { transcribeAudio } = await import("@/api");
      const result = await transcribeAudio(base64, "zh", "medium");

      console.log("[Recorder] Transcription result:", JSON.stringify(result));

      if (result.text && result.text.trim()) {
        setTranscription(result.text);
        finalTextRef.current = result.text;
        setIsTranscriptionComplete(true);
        onTranscriptionComplete?.(result.text);
        toast.success(t("home.transcriptionComplete"));
      } else {
        setTranscription("");
        finalTextRef.current = "";
        setIsTranscriptionComplete(true);
        toast.warning(t("home.noVoiceDetected"));
      }
    } catch (err: any) {
      console.error("[Recorder] Transcription error:", err);
      toast.error(err.message || t("home.transcriptionFailed"));
      setTranscription("");
      finalTextRef.current = "";
      setIsTranscriptionComplete(true);
    } finally {
      setIsTranscribing(false);
    }
  }, [onTranscriptionComplete, t]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioChunksRef.current = [];
      setTranscription("");
      setIsTranscriptionComplete(false);
      finalTextRef.current = "";

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("[Recorder] onstop fired, processing...");
        processAudioAndTranscribe();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      toast.success(t("home.recordingStarted"));

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        setRecordTime(`${mins}:${secs}`);
      }, 1000);
    } catch (err: any) {
      console.error("[Recorder] Start error:", err);
      toast.error(err.message || t("home.microphoneAccessError"));
    }
  }, [processAudioAndTranscribe, t]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    console.log("[Recorder] Stop recording, state:", recorder?.state);
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTranscription("");
    audioChunksRef.current = [];
    finalTextRef.current = "";
    setIsTranscriptionComplete(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getFinalText = useCallback(() => {
    return finalTextRef.current;
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcription,
    recordTime,
    isTranscriptionComplete,
    startRecording,
    stopRecording,
    clearRecording,
    getFinalText,
  };
}