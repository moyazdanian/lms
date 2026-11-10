"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AwardIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  XCircleIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getMyCertificates } from "@/lib/api/quiz";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function CertificateCard({ certificate }) {
  const [copied, setCopied] = useState(false);
  const isValid = certificate.status === "valid";
  const timeoutRef = useRef(null);

  async function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error("copy failed");
  }

  async function copyVerifyLink() {
    const url = certificate?.verify_url;
    if (!url) {
      toast.error("Verification link is not available.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        await fallbackCopy(url);
      }
      setCopied(true);
      toast.success("Verification link copied.");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Could not copy the link.");
    }
  }

  return (
    <Card
      className={
        isValid ? "border-success/30" : "border-destructive/30 opacity-80"
      }
    >
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            isValid
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {isValid ? (
            <AwardIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <XCircleIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">
              {certificate.course_title || "Course completion"}
            </h3>
            <Badge variant={isValid ? "default" : "destructive"}>
              {isValid ? "Valid" : "Revoked"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Serial: <span className="font-mono">{certificate.serial}</span> ·
            Issued {formatDate(certificate.issued_at)}
          </p>
          {certificate.instructor_name ? (
            <p className="text-sm text-muted-foreground">
              Instructor: {certificate.instructor_name}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isValid ? (
            <Button size="sm" asChild>
              <a href={certificate.download_url} download={certificate.serial}>
                <DownloadIcon aria-hidden="true" />
                PDF
              </a>
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={copyVerifyLink}>
            <CopyIcon aria-hidden="true" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a
              href={certificate.verify_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon aria-hidden="true" />
              Verify
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: ({ signal }) => getMyCertificates({ signal }),
  });

  const certificates = data?.data || [];
  const loading = isPending || isFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        description="Your course completion certificates. Each one has a public verification link."
      />

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="We could not load your certificates"
          message={error.message}
          onRetry={refetch}
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={AwardIcon}
          title="No certificates yet"
          description="Complete every lesson of a course (and pass its quiz, if it has one) to earn your first certificate."
        />
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id || certificate.code}
              certificate={certificate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
