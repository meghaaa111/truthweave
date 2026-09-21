import { ExternalLink } from "lucide-react";

interface Source {
  title: string;
  url: string;
}

const SourceCard = ({ source }: { source: Source }) => {
  const domain = (() => {
    try { return new URL(source.url).hostname.replace("www.", ""); } catch { return source.url; }
  })();

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 neuro-card-flat !rounded-xl transition-all duration-200 group"
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        className="w-5 h-5 rounded-sm"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{source.title}</p>
        <p className="text-xs text-muted-foreground">{domain}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </a>
  );
};

export default SourceCard;
