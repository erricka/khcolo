import {
  ArchiveRestore,
  Cloud,
  LockKeyhole,
  Mail,
  PhoneCall,
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
};

export function ServiceIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Server;
  return <Icon aria-hidden className={className} strokeWidth={1.6} />;
}
