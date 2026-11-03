export const systems = [
  { id: 'all', name: 'All systems', icon: 'layers-3', description: 'The complete assembly, from the body shell to the smallest fastener.' },
  { id: 'body', name: 'Body & exterior', icon: 'car-front', description: 'Lightweight panels, glazing, and exterior details shape the coupe.' },
  { id: 'engine', name: 'Engine & drivetrain', icon: 'settings-2', description: 'Follow the path of power from the engine to the rear wheels.' },
  { id: 'suspension', name: 'Suspension', icon: 'git-branch', description: 'Springs, dampers, and control arms keep the tires connected to the road.' },
  { id: 'brakes', name: 'Brakes & wheels', icon: 'disc-3', description: 'Explore the wheel assemblies, ventilated rotors, and brake calipers.' },
  { id: 'interior', name: 'Interior', icon: 'armchair', description: 'Inside the driver’s environment: seats, dashboard, and controls.' },
  { id: 'fasteners', name: 'Bolts & fasteners', icon: 'nut', description: 'The small connections that hold everything together.' },
];

export function matchesPart(part, system, query = '') {
  return (system === 'all' || part.system === system) && `${part.name} ${part.material} ${part.system}`.toLowerCase().includes(query.toLowerCase().trim());
}

export function explosionOffset(part, amount) {
  const t = Math.max(0, Math.min(1, amount));
  return part.explode.map(value => value * t);
}
