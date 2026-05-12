"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectDocumentTampering, type OcrDetectionResult } from "@/lib/api";
import { AlertTriangle, FileScan, Loader2, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function DocumentCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<OcrDetectionResult | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    setResult(null);
    setError("");
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextFile ? URL.createObjectURL(nextFile) : "";
    });
  };

  const checkDocument = async () => {
    if (!file) return;
    setError("");
    setResult(null);
    setIsChecking(true);
    try {
      const response = await detectDocumentTampering(file);
      setResult(response.ocr);
    } catch (error: any) {
      setError(error.message || "We could not analyze this document right now. Try another image file.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <Navbar />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-20 pt-32 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
            <FileScan className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Open Document Check</span>
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight md:text-7xl">Reality check for any certificate.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/50">
            Upload a certificate image to run Error Level Analysis and spot manipulated regions before you trust it.
          </p>
        </div>

        <Card className="glass-panel border-white/5 p-6">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/50">Upload document</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-white/35" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                  className="border-white/10 bg-white/5 pl-10 file:border-0 file:bg-transparent file:text-white"
                />
              </div>
            </div>
            <Button disabled={isChecking || !file} onClick={checkDocument} className="h-12 w-full rounded-full bg-primary font-bold text-white hover:bg-primary/90">
              {isChecking ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check Authenticity"}
            </Button>
          </div>
        </Card>

        {(result || error) && (
          <Card className="glass-panel border-white/5 p-6 lg:col-span-2">
            <div className="mb-6 flex items-start gap-3">
              {result && result.tamperingScale < 4 ? <ShieldCheck className="mt-0.5 h-5 w-5 text-success" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-400" />}
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold">{result?.verdict || "Scan unavailable"}</p>
                <p className="mt-1 text-sm leading-6 text-white/50">
                  {result ? `Tampering scale ${result.tamperingScale}/10` : error}
                </p>
              </div>
            </div>

            {result && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <ImagePanel title="Uploaded document" imageUrl={previewUrl} altText="Uploaded document preview" />
                  <ImagePanel title="ELA masked output" imageUrl={result.elaImageUrl || ""} altText="Error level analysis masked output" />
                </div>
                <div className="grid gap-3 text-xs text-white/50 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span>Verdict</span>
                    <span className="max-w-[60%] truncate text-right text-white/75">{result.verdict}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span>Regions detected</span>
                    <span>{result.detectionRegions.length}</span>
                  </div>
                </div>
                {result.detectionRegions.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="mb-2 font-bold text-white/70">Detected regions</p>
                    <div className="grid gap-1 font-mono text-[10px] text-white/50 md:grid-cols-2">
                      {result.detectionRegions.map((region, index) => (
                        <p key={`${region.x}-${region.y}-${index}`}>
                          #{index + 1}: x {region.x}, y {region.y}, w {region.w}, h {region.h}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </section>
    </main>
  );
}

function ImagePanel({ title, imageUrl, altText }: { title: string; imageUrl: string; altText: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-white/55">{title}</p>
      </div>
      <div className="flex min-h-[260px] items-center justify-center p-3">
        {imageUrl ? (
          <img src={imageUrl} alt={altText} className="max-h-[420px] w-full object-contain" />
        ) : (
          <p className="text-sm text-white/35">No image returned.</p>
        )}
      </div>
    </div>
  );
}
