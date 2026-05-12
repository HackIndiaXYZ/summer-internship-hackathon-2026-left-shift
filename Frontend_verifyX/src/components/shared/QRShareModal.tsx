"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentialId: string;
  title: string;
}

export function QRShareModal({ isOpen, onClose, credentialId, title }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/credential/${credentialId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Credential verification link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-white/10 glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Credential
          </DialogTitle>
          <DialogDescription>
            Share this verifiable proof of {title}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="p-4 bg-white rounded-xl">
            <QrCode className="w-40 h-40 text-black" />
          </div>
          
          <div className="w-full space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Link</p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
              <input 
                readOnly 
                value={shareUrl} 
                className="flex-1 bg-transparent text-xs font-mono truncate outline-none"
              />
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Email Access
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Direct Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
