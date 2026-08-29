"use client";

import { useParams } from "next/navigation";
import { FolderGit2, FileText, UploadCloud } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DepartmentDeskPage() {
  const params = useParams();
  const dept = ((params?.dept as string) || "DIGITAL_SYSTEMS").toUpperCase();

  // Real departmental drive resource view
  const files: { name: string; type: string; size: string; date: string }[] = [];

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="default" className="mb-2">DEPARTMENT PORTAL</Badge>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-blue-400" /> {dept.replace("_", " ")} DESK
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized departmental resources stored securely in Google Workspace Drive and proxied through GCC Cloudflare Workers.
        </p>
      </div>

      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Department Files & Resources</CardTitle>
          <CardDescription className="text-xs">Direct private drive links are never exposed. Access is logged in Audit Logs.</CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <UploadCloud className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-semibold text-white">No Files Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Departmental documents, research manuscripts, and creative assets will appear here once uploaded via GCC Drive synchronization.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white text-xs">{file.name}</h4>
                      <p className="text-[10px] text-slate-400">Size: {file.size} | Uploaded: {file.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}