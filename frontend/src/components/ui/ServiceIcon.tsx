import {
  ArchiveRestore,
  BookOpenCheck,
  Cloud,
  FileCheck2,
  HardHat,
  Languages,
  Layers,
  LockKeyhole,
  Mail,
  MapPinned,
  PhoneCall,
  Radar,
  Server,
  ShieldCheck,
  UsersRound,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  phone: PhoneCall,
  crm: UsersRound,
  video: Video,
  shield: ShieldCheck,
  lock: LockKeyhole,
  backup: ArchiveRestore,
  cloud: Cloud,
  server: Server,
  mail: Mail,
  wrench: Wrench,
  // Used for the "what to expect" list on the home page
  engineer: HardHat,
  layers: Layers,
  radar: Radar,
  languages: Languages,
  map: MapPinned,
  file: FileCheck2,
  book: BookOpenCheck,
};

export function ServiceIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Server;
  return <Icon aria-hidden className={className} strokeWidth={1.6} />;
}
