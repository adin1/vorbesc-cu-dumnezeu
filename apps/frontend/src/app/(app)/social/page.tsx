import { FacebookCommunityCard } from '@/components/social/FacebookCommunityCard';
import { TikTokCommunityCard } from '@/components/social/TikTokCommunityCard';
import { Card } from '@/components/ui/Card';

export default function SocialHubPage() {
  return (
    <div className="stack">
      <Card>
        <h1 style={{ marginTop: 0 }}>Social Hub</h1>
        <p className="muted" style={{ marginBottom: 0 }}>
          Toate canalele sociale într-un singur loc: TikTok pentru reach, Facebook pentru comunitate, aplicația pentru retenție și monetizare sănătoasă.
        </p>
      </Card>

      <TikTokCommunityCard />
      <FacebookCommunityCard />

      <Card>
        <h3 style={{ marginTop: 0 }}>Flow recomandat</h3>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Descoperire din TikTok sau Facebook.</li>
          <li>Intrare în aplicație cu UTM pentru atribuire corectă.</li>
          <li>Activare în comunitate: planuri, rugăciuni, jurnal.</li>
          <li>Monetizare: donații voluntare și Premium.</li>
        </ol>
      </Card>
    </div>
  );
}
