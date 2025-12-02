import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

interface DownloadSectionProps {
  onDownloadJson: () => void;
  onDownloadText: () => void;
}

export default function DownloadSection({
  onDownloadJson,
  onDownloadText,
}: DownloadSectionProps) {
  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold" data-testid="text-debate-complete">
            Debate Complete
          </h3>
          <p className="text-muted-foreground">
            Download the full transcript in your preferred format
          </p>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={onDownloadJson} variant="default" size="lg" data-testid="button-download-json">
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
          <Button onClick={onDownloadText} variant="secondary" size="lg" data-testid="button-download-txt">
            <Download className="w-4 h-4 mr-2" />
            Download .TXT
          </Button>
        </div>
      </div>
    </Card>
  );
}
