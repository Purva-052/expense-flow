import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdMobAnalyticsData } from "../types";

export const TopCountriesCard = ({
  data,
}: {
  data: AdMobAnalyticsData["topCountries"];
}) => {
  const maxEarnings = Math.max(...data.map((c) => c.earnings), 1);
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top Countries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {data.map((country) => (
          <div key={country.countryCode} className="flex items-center gap-3">
            <span className="text-xl w-7 shrink-0" title={country.countryCode}>
              {getFlagEmoji(country.countryCode)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold truncate">
                  {regionNames.of(country.countryCode) || country.countryName}
                </span>
                <span className="text-sm font-bold text-foreground ml-2">
                  {country.displayEarnings}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/80"
                  style={{
                    width: `${(country.earnings / maxEarnings) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
