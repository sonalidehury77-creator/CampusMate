import { siteConfig } from "@/config/site";

type LogoProps = {
  showTagline?: boolean;
};

export function Logo({ showTagline = false }: LogoProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold tracking-tight">
        {siteConfig.name}
      </span>

      {showTagline && (
        <span className="text-xs text-gray-500">
          Smart student companion
        </span>
      )}
    </div>
  );
}